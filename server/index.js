import express from 'express';
import cors from 'cors';
import { TTLCache } from './cache.js';
import { fetchWeather, geocodeSearch } from './providers/openmeteo.js';
import { fetchAlerts } from './providers/nws.js';
import { generateReport } from './providers/llm.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Caches
const weatherCache = new TTLCache(5 * 60 * 1000);   // 5 min
const geocodeCache = new TTLCache(60 * 60 * 1000);   // 1 hour
const alertsCache = new TTLCache(5 * 60 * 1000);     // 5 min
const reportCache = new TTLCache(15 * 60 * 1000);    // 15 min

// --- Weather ---
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon, units = 'imperial' } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

        const key = TTLCache.geoKey(lat, lon, `weather:${units}`);
        let data = weatherCache.get(key);
        if (!data) {
            data = await fetchWeather(lat, lon, units);
            weatherCache.set(key, data);
        }
        res.json(data);
    } catch (err) {
        console.error('Weather error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- Geocode ---
app.get('/api/geocode', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json([]);

        const key = `geo:${q.toLowerCase().trim()}`;
        let data = geocodeCache.get(key);
        if (!data) {
            data = await geocodeSearch(q);
            geocodeCache.set(key, data);
        }
        res.json(data);
    } catch (err) {
        console.error('Geocode error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- Alerts ---
app.get('/api/alerts', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

        const key = TTLCache.geoKey(lat, lon, 'alerts');
        let data = alertsCache.get(key);
        if (!data) {
            data = await fetchAlerts(lat, lon);
            alertsCache.set(key, data);
        }
        res.json(data);
    } catch (err) {
        console.error('Alerts error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- AI Report ---
app.get('/api/report', async (req, res) => {
    try {
        const { lat, lon, name = 'this location', units = 'imperial' } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

        const key = TTLCache.geoKey(lat, lon, `report:${units}`);
        let report = reportCache.get(key);
        if (!report) {
            // Fetch weather + alerts data
            const weatherKey = TTLCache.geoKey(lat, lon, `weather:${units}`);
            let weatherData = weatherCache.get(weatherKey);
            if (!weatherData) {
                weatherData = await fetchWeather(lat, lon, units);
                weatherCache.set(weatherKey, weatherData);
            }

            const alertsKey = TTLCache.geoKey(lat, lon, 'alerts');
            let alertsData = alertsCache.get(alertsKey);
            if (!alertsData) {
                alertsData = await fetchAlerts(lat, lon);
                alertsCache.set(alertsKey, alertsData);
            }

            report = await generateReport(weatherData, alertsData, name);
            reportCache.set(key, report);
        }
        res.json({ report });
    } catch (err) {
        console.error('Report error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- Serve static in production ---
if (process.env.NODE_ENV === 'production') {
    const { default: path } = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Weather server running on port ${PORT}`);
});

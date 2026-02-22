// Backend URL — set via env var at build time, fallback to localhost for dev
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchWeather(lat, lon, units = 'imperial') {
    const res = await fetch(`${BASE}/weather/forecast?lat=${lat}&lon=${lon}&units=${units}`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return res.json();
}

export async function fetchGeocode(query) {
    if (!query || query.length < 2) return [];
    const res = await fetch(`${BASE}/weather/geocode?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search locations');
    return res.json();
}

export async function fetchAlerts(lat, lon) {
    const res = await fetch(`${BASE}/weather/alerts?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
}

export async function fetchReport(lat, lon, name, units = 'imperial') {
    const res = await fetch(`${BASE}/weather/report?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}&units=${units}`);
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
}

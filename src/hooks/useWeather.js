import { useState, useEffect, useCallback } from 'react';
import { fetchWeather, fetchAlerts, fetchReport } from '@/lib/api';

export function useWeather() {
    const [location, setLocation] = useState(() => {
        try {
            const saved = localStorage.getItem('weather-location');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [weather, setWeather] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [units, setUnits] = useState(() => {
        return localStorage.getItem('weather-units') || 'imperial';
    });

    // Core fetch — optionally shows loading spinner
    const loadWeather = useCallback(async (loc, currentUnits, { silent = false } = {}) => {
        if (!loc) return;
        if (!silent) setLoading(true);
        setError(null);
        try {
            const [weatherData, alertsData, reportData] = await Promise.all([
                fetchWeather(loc.lat, loc.lon, currentUnits),
                fetchAlerts(loc.lat, loc.lon),
                fetchReport(loc.lat, loc.lon, loc.name, currentUnits),
            ]);
            setWeather(weatherData);
            setAlerts(alertsData);
            setReport(reportData.report);
        } catch (err) {
            setError(err.message);
            console.error('Weather load error:', err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const selectLocation = useCallback((loc) => {
        setLocation(loc);
        localStorage.setItem('weather-location', JSON.stringify(loc));
        loadWeather(loc, units);
    }, [loadWeather, units]);

    // Toggle units — silent background refresh, no spinner
    const toggleUnits = useCallback(() => {
        const newUnits = units === 'imperial' ? 'metric' : 'imperial';
        setUnits(newUnits);
        localStorage.setItem('weather-units', newUnits);
        if (location) loadWeather(location, newUnits, { silent: true });
    }, [units, location, loadWeather]);

    // Load on mount (with spinner) and auto-refresh every 5 min (silent)
    useEffect(() => {
        if (!location) return;

        loadWeather(location, units);

        const intervalId = setInterval(() => {
            console.log('Auto-refreshing weather data...');
            loadWeather(location, units, { silent: true });
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(intervalId);
    }, [location, loadWeather]); // NOTE: removed `units` dep — unit changes handled by toggleUnits

    return {
        location, weather, alerts, report, loading, error, units,
        selectLocation, toggleUnits, loadWeather: () => loadWeather(location, units),
    };
}

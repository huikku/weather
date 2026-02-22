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

    const loadWeather = useCallback(async (loc, currentUnits) => {
        if (!loc) return;
        setLoading(true);
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
            setLoading(false);
        }
    }, []);

    const selectLocation = useCallback((loc) => {
        setLocation(loc);
        localStorage.setItem('weather-location', JSON.stringify(loc));
        loadWeather(loc, units);
    }, [loadWeather, units]);

    const toggleUnits = useCallback(() => {
        const newUnits = units === 'imperial' ? 'metric' : 'imperial';
        setUnits(newUnits);
        localStorage.setItem('weather-units', newUnits);
        if (location) loadWeather(location, newUnits);
    }, [units, location, loadWeather]);

    // Load on mount if location is saved
    useEffect(() => {
        if (location) loadWeather(location, units);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        location, weather, alerts, report, loading, error, units,
        selectLocation, toggleUnits, loadWeather: () => loadWeather(location, units),
    };
}

const BASE = '/api';

export async function fetchWeather(lat, lon, units = 'imperial') {
    const res = await fetch(`${BASE}/weather?lat=${lat}&lon=${lon}&units=${units}`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return res.json();
}

export async function fetchGeocode(query) {
    if (!query || query.length < 2) return [];
    const res = await fetch(`${BASE}/geocode?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search locations');
    return res.json();
}

export async function fetchAlerts(lat, lon) {
    const res = await fetch(`${BASE}/alerts?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
}

export async function fetchReport(lat, lon, name, units = 'imperial') {
    const res = await fetch(`${BASE}/report?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}&units=${units}`);
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
}

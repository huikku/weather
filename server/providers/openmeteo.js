const BASE = 'https://api.open-meteo.com/v1/forecast';
const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

export async function fetchWeather(lat, lon, units = 'imperial') {
    const tempUnit = units === 'imperial' ? 'fahrenheit' : 'celsius';
    const windUnit = units === 'imperial' ? 'mph' : 'kmh';
    const precipUnit = units === 'imperial' ? 'inch' : 'mm';

    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: [
            'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
            'weather_code', 'wind_speed_10m', 'wind_direction_10m',
            'precipitation', 'is_day'
        ].join(','),
        hourly: [
            'temperature_2m', 'weather_code', 'precipitation_probability',
            'wind_speed_10m', 'is_day'
        ].join(','),
        daily: [
            'weather_code', 'temperature_2m_max', 'temperature_2m_min',
            'precipitation_probability_max', 'sunrise', 'sunset',
            'uv_index_max', 'wind_speed_10m_max'
        ].join(','),
        temperature_unit: tempUnit,
        wind_speed_unit: windUnit,
        precipitation_unit: precipUnit,
        timezone: 'auto',
        forecast_days: 7,
        forecast_hours: 24,
    });

    const res = await fetch(`${BASE}?${params}`);
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
    return res.json();
}

export async function geocodeSearch(query) {
    const params = new URLSearchParams({
        name: query,
        count: 8,
        language: 'en',
        format: 'json',
    });

    const res = await fetch(`${GEO_BASE}?${params}`);
    if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);
    const data = await res.json();

    if (!data.results) return [];

    return data.results.map(r => ({
        id: r.id,
        name: r.name,
        admin1: r.admin1 || '',
        country: r.country || '',
        countryCode: r.country_code || '',
        lat: r.latitude,
        lon: r.longitude,
        label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    }));
}

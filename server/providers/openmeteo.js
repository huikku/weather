const BASE = 'https://api.open-meteo.com/v1/forecast';
const ECMWF_BASE = 'https://api.open-meteo.com/v1/ecmwf';
const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

export async function fetchWeather(lat, lon, units = 'imperial') {
    const tempUnit = units === 'imperial' ? 'fahrenheit' : 'celsius';
    const windUnit = units === 'imperial' ? 'mph' : 'kmh';
    const precipUnit = units === 'imperial' ? 'inch' : 'mm';

    const commonDaily = [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'precipitation_probability_max', 'precipitation_sum', 'snowfall_sum',
        'sunrise', 'sunset', 'uv_index_max', 'wind_speed_10m_max',
        'wind_gusts_10m_max'
    ].join(',');

    // Primary forecast (best model blend — GFS/HRRR for US)
    const primaryParams = new URLSearchParams({
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
        daily: commonDaily,
        temperature_unit: tempUnit,
        wind_speed_unit: windUnit,
        precipitation_unit: precipUnit,
        timezone: 'auto',
        forecast_days: 14,
        forecast_hours: 24,
    });

    // ECMWF model for comparison (independent European model)
    const ecmwfParams = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        daily: [
            'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        ].join(','),
        temperature_unit: tempUnit,
        wind_speed_unit: windUnit,
        precipitation_unit: precipUnit,
        timezone: 'auto',
        forecast_days: 14,
    });

    const [primaryRes, ecmwfRes] = await Promise.all([
        fetch(`${BASE}?${primaryParams}`),
        fetch(`${ECMWF_BASE}?${ecmwfParams}`).catch(() => null),
    ]);

    if (!primaryRes.ok) throw new Error(`Open-Meteo error: ${primaryRes.status}`);
    const primary = await primaryRes.json();

    let ecmwf = null;
    if (ecmwfRes?.ok) {
        ecmwf = await ecmwfRes.json();
    }

    return { ...primary, ecmwf };
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

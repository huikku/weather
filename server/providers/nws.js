const NWS_BASE = 'https://api.weather.gov';
const USER_AGENT = 'WeatherApp/1.0 (personal weather dashboard)';

const headers = {
    'User-Agent': USER_AGENT,
    'Accept': 'application/geo+json',
};

export async function fetchAlerts(lat, lon) {
    try {
        // NWS only works for US locations
        const pointRes = await fetch(`${NWS_BASE}/points/${lat},${lon}`, { headers });
        if (!pointRes.ok) return { alerts: [], forecast: null };

        const pointData = await pointRes.json();
        const zoneId = pointData.properties?.forecastZone?.split('/').pop();

        if (!zoneId) return { alerts: [], forecast: null };

        // Fetch active alerts for the zone
        const alertRes = await fetch(`${NWS_BASE}/alerts/active/zone/${zoneId}`, { headers });
        let alerts = [];
        if (alertRes.ok) {
            const alertData = await alertRes.json();
            alerts = (alertData.features || []).map(f => ({
                id: f.properties.id,
                event: f.properties.event,
                severity: f.properties.severity,
                urgency: f.properties.urgency,
                headline: f.properties.headline,
                description: f.properties.description,
                instruction: f.properties.instruction,
                expires: f.properties.expires,
            }));
        }

        // Fetch the text forecast
        const forecastUrl = pointData.properties?.forecast;
        let forecast = null;
        if (forecastUrl) {
            const fRes = await fetch(forecastUrl, { headers });
            if (fRes.ok) {
                const fData = await fRes.json();
                const periods = fData.properties?.periods || [];
                forecast = periods.slice(0, 4).map(p => ({
                    name: p.name,
                    temperature: p.temperature,
                    temperatureUnit: p.temperatureUnit,
                    windSpeed: p.windSpeed,
                    windDirection: p.windDirection,
                    shortForecast: p.shortForecast,
                    detailedForecast: p.detailedForecast,
                    isDaytime: p.isDaytime,
                }));
            }
        }

        return { alerts, forecast };
    } catch (err) {
        console.error('NWS fetch error:', err.message);
        return { alerts: [], forecast: null };
    }
}

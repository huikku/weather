import { GoogleGenerativeAI } from '@google/generative-ai';

const DEEPINFRA_BASE = 'https://api.deepinfra.com/v1/openai/chat/completions';

function buildPrompt(weatherData, alertsData, locationName) {
    const c = weatherData.current;
    const daily = weatherData.daily;
    const hourly = weatherData.hourly;
    const units = weatherData.current_units;

    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
    const month = now.toLocaleDateString('en-US', { month: 'long' });

    let alertText = '';
    if (alertsData?.alerts?.length > 0) {
        alertText = `\nACTIVE WEATHER ALERTS:\n${alertsData.alerts.map(a => `- ${a.event}: ${a.headline}`).join('\n')}`;
    }

    let nwsForecastText = '';
    if (alertsData?.forecast?.length > 0) {
        nwsForecastText = `\nNWS OFFICIAL FORECAST:\n${alertsData.forecast.map(p => `- ${p.name}: ${p.shortForecast}, ${p.temperature}°${p.temperatureUnit}`).join('\n')}`;
    }

    return `You are a concise, friendly weather reporter. Write a brief weather narrative for ${locationName}.
It is ${dayOfWeek} ${timeOfDay} in ${month}.

CURRENT CONDITIONS:
- Temperature: ${c.temperature_2m}${units.temperature_2m}
- Feels like: ${c.apparent_temperature}${units.apparent_temperature}
- Humidity: ${c.relative_humidity_2m}%
- Wind: ${c.wind_speed_10m} ${units.wind_speed_10m}
- Weather code: ${c.weather_code}
- Precipitation: ${c.precipitation} ${units.precipitation}

NEXT 12 HOURS TREND:
${hourly.time.slice(0, 12).map((t, i) => `- ${new Date(t).getHours()}:00 → ${hourly.temperature_2m[i]}${units.temperature_2m}, precip chance ${hourly.precipitation_probability[i]}%`).join('\n')}

7-DAY OUTLOOK:
${daily.time.map((t, i) => `- ${new Date(t + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' })}: H ${daily.temperature_2m_max[i]}° / L ${daily.temperature_2m_min[i]}°, precip ${daily.precipitation_probability_max[i]}%, UV ${daily.uv_index_max[i]}`).join('\n')}
${alertText}${nwsForecastText}

RULES:
- Keep it to 3-5 sentences max
- Be conversational and practical (mention driving conditions, outdoor plans, etc.)
- If there are alerts, mention them prominently
- Don't list raw numbers, weave them naturally into prose
- Don't use emoji or markdown formatting
- Don't sign off or use a greeting`;
}

async function generateWithGemini(prompt, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function generateWithDeepInfra(prompt, apiKey) {
    const res = await fetch(DEEPINFRA_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
            temperature: 0.7,
        }),
    });
    if (!res.ok) throw new Error(`DeepInfra error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

export async function generateReport(weatherData, alertsData, locationName) {
    const prompt = buildPrompt(weatherData, alertsData, locationName);

    // Try Gemini first, fall back to DeepInfra
    const geminiKey = process.env.GEMINI_API_KEY;
    const deepinfraKey = process.env.DEEPINFRA_API_KEY;

    if (geminiKey) {
        try {
            return await generateWithGemini(prompt, geminiKey);
        } catch (err) {
            console.error('Gemini failed, trying DeepInfra:', err.message);
        }
    }

    if (deepinfraKey) {
        try {
            return await generateWithDeepInfra(prompt, deepinfraKey);
        } catch (err) {
            console.error('DeepInfra failed:', err.message);
        }
    }

    return 'AI weather report is temporarily unavailable. Check the forecast data below.';
}

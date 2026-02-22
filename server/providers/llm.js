import { GoogleGenerativeAI } from '@google/generative-ai';

const DEEPINFRA_BASE = 'https://api.deepinfra.com/v1/openai/chat/completions';

function buildPrompt(weatherData, alertsData, locationName) {
    const c = weatherData.current;
    const daily = weatherData.daily;
    const hourly = weatherData.hourly;
    const units = weatherData.current_units;
    const ecmwf = weatherData.ecmwf;

    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
    const month = now.toLocaleDateString('en-US', { month: 'long' });

    let alertText = '';
    if (alertsData?.alerts?.length > 0) {
        alertText = `\n\nACTIVE WEATHER ALERTS:\n${alertsData.alerts.map(a => `- ${a.event} (${a.severity}): ${a.headline}`).join('\n')}`;
    }

    let nwsForecastText = '';
    if (alertsData?.forecast?.length > 0) {
        nwsForecastText = `\n\nNWS OFFICIAL FORECAST (human-written by meteorologists):\n${alertsData.forecast.map(p => `- ${p.name}: ${p.detailedForecast}`).join('\n')}`;
    }

    // Build ECMWF comparison if available
    let ecmwfComparison = '';
    if (ecmwf?.daily) {
        const ecmwfDays = ecmwf.daily.time.slice(0, 7).map((t, i) => {
            const primaryHigh = daily.temperature_2m_max[i];
            const primaryLow = daily.temperature_2m_min[i];
            const ecmwfHigh = ecmwf.daily.temperature_2m_max[i];
            const ecmwfLow = ecmwf.daily.temperature_2m_min[i];
            const highDiff = Math.abs(primaryHigh - ecmwfHigh);
            const dayLabel = new Date(t + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' });
            return `- ${dayLabel}: Primary H${Math.round(primaryHigh)}°/L${Math.round(primaryLow)}° vs ECMWF H${Math.round(ecmwfHigh)}°/L${Math.round(ecmwfLow)}° ${highDiff > 3 ? '** MODELS DISAGREE **' : '(agreement)'}`;
        }).join('\n');
        ecmwfComparison = `\n\nMULTI-MODEL COMPARISON (Primary GFS/HRRR blend vs ECMWF European model):\n${ecmwfDays}`;
    }

    return `You are an expert meteorologist AI. Analyze weather data from MULTIPLE sources and provide an insightful forecast for ${locationName}.
It is ${dayOfWeek} ${timeOfDay} in ${month}.

CURRENT CONDITIONS (Open-Meteo, best-available model blend):
- Temperature: ${c.temperature_2m}${units.temperature_2m}
- Feels like: ${c.apparent_temperature}${units.apparent_temperature}
- Humidity: ${c.relative_humidity_2m}%
- Wind: ${c.wind_speed_10m} ${units.wind_speed_10m} from ${c.wind_direction_10m}°
- Weather code: ${c.weather_code}
- Precipitation: ${c.precipitation} ${units.precipitation}

NEXT 12 HOURS (hourly trend):
${hourly.time.slice(0, 12).map((t, i) => `- ${new Date(t).getHours()}:00 → ${hourly.temperature_2m[i]}${units.temperature_2m}, precip ${hourly.precipitation_probability[i]}%`).join('\n')}

14-DAY OUTLOOK (Primary model):
${daily.time.map((t, i) => `- ${new Date(t + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: H ${daily.temperature_2m_max[i]}° / L ${daily.temperature_2m_min[i]}°, precip ${daily.precipitation_probability_max[i]}%, UV ${daily.uv_index_max[i]}`).join('\n')}
${ecmwfComparison}${alertText}${nwsForecastText}

ANALYSIS INSTRUCTIONS:
- Start with current conditions and immediate outlook (today/tonight)
- Highlight any significant weather changes or patterns in the coming days
- When models disagree, mention it and give your best assessment of which is more likely
- If NWS meteorologist forecasts are available, incorporate their expert analysis
- If there are alerts, lead with them prominently
- Mention practical impacts: driving, outdoor plans, what to wear
- Note any temperature trends (warming/cooling patterns) over the extended forecast
- Keep it to 4-6 sentences — dense with insight, not filler
- Don't use emoji or markdown formatting
- Don't sign off or greet`;
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
            max_tokens: 400,
            temperature: 0.7,
        }),
    });
    if (!res.ok) throw new Error(`DeepInfra error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

export async function generateReport(weatherData, alertsData, locationName) {
    const prompt = buildPrompt(weatherData, alertsData, locationName);

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

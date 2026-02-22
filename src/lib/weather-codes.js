// WMO Weather interpretation codes → Lucide icon name + description
// https://open-meteo.com/en/docs#weathervariables
const codes = {
    0: { icon: 'Sun', desc: 'Clear sky' },
    1: { icon: 'Sun', desc: 'Mainly clear' },
    2: { icon: 'CloudSun', desc: 'Partly cloudy' },
    3: { icon: 'Cloud', desc: 'Overcast' },
    45: { icon: 'CloudFog', desc: 'Foggy' },
    48: { icon: 'CloudFog', desc: 'Rime fog' },
    51: { icon: 'CloudDrizzle', desc: 'Light drizzle' },
    53: { icon: 'CloudDrizzle', desc: 'Moderate drizzle' },
    55: { icon: 'CloudDrizzle', desc: 'Dense drizzle' },
    56: { icon: 'CloudDrizzle', desc: 'Freezing drizzle' },
    57: { icon: 'CloudDrizzle', desc: 'Heavy freezing drizzle' },
    61: { icon: 'CloudRain', desc: 'Slight rain' },
    63: { icon: 'CloudRain', desc: 'Moderate rain' },
    65: { icon: 'CloudRain', desc: 'Heavy rain' },
    66: { icon: 'CloudRain', desc: 'Light freezing rain' },
    67: { icon: 'CloudRain', desc: 'Heavy freezing rain' },
    71: { icon: 'Snowflake', desc: 'Slight snow' },
    73: { icon: 'Snowflake', desc: 'Moderate snow' },
    75: { icon: 'Snowflake', desc: 'Heavy snow' },
    77: { icon: 'Snowflake', desc: 'Snow grains' },
    80: { icon: 'CloudRain', desc: 'Slight rain showers' },
    81: { icon: 'CloudRain', desc: 'Moderate rain showers' },
    82: { icon: 'CloudRain', desc: 'Violent rain showers' },
    85: { icon: 'Snowflake', desc: 'Slight snow showers' },
    86: { icon: 'Snowflake', desc: 'Heavy snow showers' },
    95: { icon: 'CloudLightning', desc: 'Thunderstorm' },
    96: { icon: 'CloudLightning', desc: 'Thunderstorm with hail' },
    99: { icon: 'CloudLightning', desc: 'Thunderstorm with heavy hail' },
};

// Night variants
const nightIcons = {
    'Sun': 'Moon',
    'CloudSun': 'CloudMoon',
};

export function getWeatherInfo(code, isDay = true) {
    const info = codes[code] || { icon: 'Cloud', desc: 'Unknown' };
    const icon = (!isDay && nightIcons[info.icon]) ? nightIcons[info.icon] : info.icon;
    return { icon, desc: info.desc };
}

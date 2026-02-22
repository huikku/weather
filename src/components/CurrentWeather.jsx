import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getWeatherInfo } from '@/lib/weather-codes';

function WeatherIcon({ code, isDay, className }) {
    const { icon } = getWeatherInfo(code, isDay);
    const IconComp = Icons[icon] || Icons.Cloud;
    return <IconComp className={className} />;
}

export function CurrentWeather({ weather, location, units }) {
    if (!weather?.current) return null;

    const c = weather.current;
    const cu = weather.current_units;
    const daily = weather.daily;
    const { desc } = getWeatherInfo(c.weather_code, c.is_day);

    const details = [
        { label: 'Humidity', value: `${c.relative_humidity_2m}%` },
        { label: 'Wind', value: `${c.wind_speed_10m} ${cu.wind_speed_10m}` },
        { label: 'UV Index', value: daily?.uv_index_max?.[0]?.toString() || '—' },
        { label: 'Precip', value: `${c.precipitation} ${cu.precipitation}` },
        { label: 'Sunrise', value: daily?.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—' },
        { label: 'Sunset', value: daily?.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—' },
    ];

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-br from-card to-primary/[0.04] border border-border rounded-2xl p-6 mb-5 overflow-hidden"
        >
            {/* Subtle glow */}
            <div className="absolute -top-1/2 -right-1/3 w-72 h-72 bg-radial from-primary/8 to-transparent pointer-events-none" />

            {/* Location */}
            <div className="relative">
                <h1 className="font-heading font-bold text-2xl tracking-tight">
                    {location?.name || 'Unknown'}
                </h1>
                {location?.label && location.label !== location.name && (
                    <p className="text-muted-foreground text-xs mt-0.5">{location.label}</p>
                )}
            </div>

            {/* Hero temp */}
            <div className="text-center py-6 relative">
                <div className="flex items-center justify-center gap-3">
                    <WeatherIcon
                        code={c.weather_code}
                        isDay={c.is_day}
                        className="w-14 h-14 text-primary drop-shadow-lg"
                    />
                    <span className="text-7xl font-light tracking-tighter bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {Math.round(c.temperature_2m)}°
                    </span>
                </div>
                <p className="text-base font-medium mt-2">{desc}</p>
                <p className="text-muted-foreground text-sm mt-1">
                    Feels like {Math.round(c.apparent_temperature)}°
                </p>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-3 gap-2.5 relative">
                {details.map((d, i) => (
                    <motion.div
                        key={d.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="glass rounded-xl p-3 text-center hover:bg-white/[0.05] transition-colors"
                    >
                        <span className="block text-[0.68rem] uppercase tracking-widest text-muted-foreground mb-1">
                            {d.label}
                        </span>
                        <span className="text-sm font-semibold font-mono">{d.value}</span>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}

import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getWeatherInfo } from '@/lib/weather-codes';

export function DailyForecast({ weather }) {
    if (!weather?.daily) return null;

    const { daily } = weather;

    // Find temp range for bar visualization
    const allTemps = [...daily.temperature_2m_max, ...daily.temperature_2m_min];
    const globalMin = Math.min(...allTemps);
    const globalMax = Math.max(...allTemps);
    const range = globalMax - globalMin || 1;

    const days = daily.time.map((time, i) => {
        const date = new Date(time + 'T12:00');
        const isToday = i === 0;
        const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const { icon } = getWeatherInfo(daily.weather_code[i], true);
        const IconComp = Icons[icon] || Icons.Cloud;

        const low = daily.temperature_2m_min[i];
        const high = daily.temperature_2m_max[i];
        const barLeft = ((low - globalMin) / range) * 100;
        const barWidth = ((high - low) / range) * 100;

        return {
            key: time,
            dayName,
            dateStr,
            IconComp,
            high: Math.round(high),
            low: Math.round(low),
            barLeft,
            barWidth,
            isToday,
        };
    });

    return (
        <section className="mb-5">
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                14-Day Forecast
            </h2>
            <div className="flex flex-col gap-1.5">
                {days.map((d, i) => (
                    <motion.div
                        key={d.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border p-3.5 px-4 transition-colors ${d.isToday ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-card/80'
                            }`}
                    >
                        {/* Day name */}
                        <div className="text-sm font-medium">
                            {d.dayName}
                            <span className="text-muted-foreground text-xs font-normal ml-1.5">{d.dateStr}</span>
                        </div>

                        {/* Icon */}
                        <d.IconComp className="w-5 h-5 text-foreground/70" />

                        {/* Temp range */}
                        <div className="flex items-center justify-end gap-3">
                            <span className="text-xs text-muted-foreground font-mono w-8 text-right">{d.low}°</span>
                            <div className="w-16 h-1 bg-border rounded-full relative overflow-hidden">
                                <motion.div
                                    className="absolute h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(d.barWidth, 8)}%` }}
                                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                                    style={{ left: `${d.barLeft}%` }}
                                />
                            </div>
                            <span className="text-sm font-semibold font-mono w-8">{d.high}°</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getWeatherInfo } from '@/lib/weather-codes';
import { Droplets, Wind, Snowflake, ChevronDown } from 'lucide-react';

export function DailyForecast({ weather }) {
    const [expandedDay, setExpandedDay] = useState(null);

    if (!weather?.daily) return null;

    const { daily } = weather;
    const units = weather.daily_units || {};

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
        const { icon, desc } = getWeatherInfo(daily.weather_code[i], true);
        const IconComp = Icons[icon] || Icons.Cloud;

        const low = daily.temperature_2m_min[i];
        const high = daily.temperature_2m_max[i];
        const barLeft = ((low - globalMin) / range) * 100;
        const barWidth = ((high - low) / range) * 100;

        const precip = daily.precipitation_sum?.[i] || 0;
        const snow = daily.snowfall_sum?.[i] || 0;
        const precipProb = daily.precipitation_probability_max?.[i] || 0;
        const windMax = daily.wind_speed_10m_max?.[i] || 0;
        const gustMax = daily.wind_gusts_10m_max?.[i] || 0;
        const uvMax = daily.uv_index_max?.[i] || 0;

        return {
            key: time,
            dayName, dateStr, IconComp, desc,
            high: Math.round(high), low: Math.round(low),
            barLeft, barWidth, isToday,
            precip, snow, precipProb, windMax, gustMax, uvMax,
        };
    });

    return (
        <section className="mb-5">
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                14-Day Forecast
            </h2>
            <div className="flex flex-col gap-1.5">
                {days.map((d, i) => {
                    const isExpanded = expandedDay === d.key;
                    return (
                        <motion.div
                            key={d.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`rounded-xl border overflow-hidden transition-colors cursor-pointer ${d.isToday ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-card/80'
                                }`}
                            onClick={() => setExpandedDay(isExpanded ? null : d.key)}
                        >
                            {/* Main row */}
                            <div className="grid grid-cols-[1fr_auto_auto_1fr] items-center gap-3 p-3.5 px-4">
                                {/* Day name */}
                                <div className="text-sm font-medium">
                                    {d.dayName}
                                    <span className="text-muted-foreground text-xs font-normal ml-1.5">{d.dateStr}</span>
                                </div>

                                {/* Icon */}
                                <d.IconComp className="w-5 h-5 text-foreground/70" />

                                {/* Quick stats */}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {d.precipProb > 0 && (
                                        <span className="flex items-center gap-0.5 text-primary">
                                            <Droplets className="w-3 h-3" />
                                            {d.precipProb}%
                                        </span>
                                    )}
                                    {d.snow > 0 && (
                                        <span className="flex items-center gap-0.5 text-sky-300">
                                            <Snowflake className="w-3 h-3" />
                                            {d.snow.toFixed(1)}"
                                        </span>
                                    )}
                                    {d.windMax > 20 && (
                                        <span className="flex items-center gap-0.5">
                                            <Wind className="w-3 h-3" />
                                            {Math.round(d.windMax)}
                                        </span>
                                    )}
                                </div>

                                {/* Temp range */}
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-xs text-muted-foreground font-mono w-8 text-right">{d.low}°</span>
                                    <div className="w-14 h-1 bg-border rounded-full relative overflow-hidden">
                                        <motion.div
                                            className="absolute h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(d.barWidth, 8)}%` }}
                                            transition={{ delay: 0.2 + i * 0.03, duration: 0.5 }}
                                            style={{ left: `${d.barLeft}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold font-mono w-8">{d.high}°</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Expanded detail row */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-3.5 pt-0.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            <DetailChip icon={Droplets} label="Precip" value={`${d.precip.toFixed(2)} ${units.precipitation_sum || 'in'}`} show={true} />
                                            <DetailChip icon={Snowflake} label="Snow" value={`${d.snow.toFixed(1)} ${units.snowfall_sum || 'in'}`} show={true} />
                                            <DetailChip icon={Wind} label="Wind" value={`${Math.round(d.windMax)} ${units.wind_speed_10m_max || 'mp/h'}`} show={true} />
                                            <DetailChip icon={Wind} label="Gusts" value={`${Math.round(d.gustMax)} ${units.wind_gusts_10m_max || 'mp/h'}`} show={true} />
                                        </div>
                                        <div className="px-4 pb-3 text-xs text-muted-foreground">
                                            {d.desc} · UV {d.uvMax} · Precip chance {d.precipProb}%
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}

function DetailChip({ icon: Icon, label, value, show }) {
    if (!show) return null;
    return (
        <div className="flex items-center gap-2 bg-background/40 rounded-lg px-3 py-2">
            <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div>
                <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="text-xs font-mono font-medium text-foreground">{value}</div>
            </div>
        </div>
    );
}

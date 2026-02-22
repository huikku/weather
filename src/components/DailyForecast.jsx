import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getWeatherInfo } from '@/lib/weather-codes';
import { Droplets, Wind, Snowflake, ChevronDown, Sun } from 'lucide-react';

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
            key: time, dayName, dateStr, IconComp, desc,
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

            {/* Column headers */}
            <div className="grid items-center gap-x-2 px-4 pb-1.5 text-[0.6rem] uppercase tracking-widest text-muted-foreground/60" style={{ gridTemplateColumns: 'minmax(90px, 1fr) 28px 52px 52px 52px minmax(100px, 1.2fr) 20px' }}>
                <span>Day</span>
                <span></span>
                <span className="text-center">Rain</span>
                <span className="text-center">Snow</span>
                <span className="text-center">Wind</span>
                <span className="text-right pr-1">Temp</span>
                <span></span>
            </div>

            <div className="flex flex-col gap-1">
                {days.map((d, i) => {
                    const isExpanded = expandedDay === d.key;
                    return (
                        <motion.div
                            key={d.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.025 }}
                            className={`rounded-xl border overflow-hidden transition-colors cursor-pointer ${d.isToday ? 'border-primary/60 bg-primary/8' : 'border-border bg-card hover:bg-card/80'
                                }`}
                            onClick={() => setExpandedDay(isExpanded ? null : d.key)}
                        >
                            {/* Main row — columnar layout */}
                            <div className="grid items-center gap-x-2 px-4 py-3.5" style={{ gridTemplateColumns: 'minmax(90px, 1fr) 28px 52px 52px 52px minmax(100px, 1.2fr) 20px' }}>
                                {/* Day */}
                                <div className="min-w-0">
                                    <span className="text-base font-semibold">{d.dayName}</span>
                                    <span className="text-muted-foreground text-sm font-normal ml-1.5">{d.dateStr}</span>
                                </div>

                                {/* Icon */}
                                <d.IconComp className="w-5 h-5 text-foreground/60" />

                                {/* Rain */}
                                <div className="text-center">
                                    {d.precipProb > 0 ? (
                                        <span className="text-sm text-primary font-semibold">{d.precipProb}%</span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground/40">—</span>
                                    )}
                                </div>

                                {/* Snow */}
                                <div className="text-center">
                                    {d.snow > 0 ? (
                                        <span className="text-sm text-sky-300 font-semibold">{d.snow.toFixed(1)}"</span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground/40">—</span>
                                    )}
                                </div>

                                {/* Wind */}
                                <div className="text-center">
                                    <span className="text-sm text-muted-foreground font-mono">{Math.round(d.windMax)}</span>
                                </div>

                                {/* Temp range */}
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-sm text-muted-foreground font-mono w-8 text-right">{d.low}°</span>
                                    <div className="w-14 h-1.5 bg-border rounded-full relative overflow-hidden flex-shrink-0">
                                        <motion.div
                                            className="absolute h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(d.barWidth, 10)}%` }}
                                            transition={{ delay: 0.2 + i * 0.025, duration: 0.4 }}
                                            style={{ left: `${d.barLeft}%` }}
                                        />
                                    </div>
                                    <span className="text-base font-bold font-mono w-8">{d.high}°</span>
                                </div>

                                {/* Chevron */}
                                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
                                        <div className="px-3 sm:px-4 pb-3 pt-0.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <DetailChip icon={Droplets} label="Precip" value={`${d.precip.toFixed(2)} ${units.precipitation_sum || 'in'}`} />
                                            <DetailChip icon={Snowflake} label="Snow" value={`${d.snow.toFixed(1)} ${units.snowfall_sum || 'in'}`} />
                                            <DetailChip icon={Wind} label="Wind" value={`${Math.round(d.windMax)} ${units.wind_speed_10m_max || 'mp/h'}`} />
                                            <DetailChip icon={Wind} label="Gusts" value={`${Math.round(d.gustMax)} ${units.wind_gusts_10m_max || 'mp/h'}`} />
                                        </div>
                                        <div className="px-4 pb-3 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{d.desc}</span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> UV {d.uvMax}</span>
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

function DetailChip({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-2.5 bg-background/40 rounded-lg px-3 py-2">
            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
                <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="text-sm font-mono font-semibold text-foreground truncate">{value}</div>
            </div>
        </div>
    );
}

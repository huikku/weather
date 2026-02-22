import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getWeatherInfo } from '@/lib/weather-codes';
import { Droplets } from 'lucide-react';

export function HourlyForecast({ weather }) {
    if (!weather?.hourly) return null;

    const { hourly } = weather;
    const now = new Date();
    const currentHour = now.getHours();

    // Get next 24 hours
    const hours = hourly.time.slice(0, 24).map((time, i) => {
        const date = new Date(time);
        const hour = date.getHours();
        const isNow = i === 0;
        const { icon } = getWeatherInfo(hourly.weather_code[i], hourly.is_day[i]);
        const IconComp = Icons[icon] || Icons.Cloud;

        return {
            key: time,
            label: isNow ? 'Now' : date.toLocaleTimeString('en-US', { hour: 'numeric' }),
            temp: Math.round(hourly.temperature_2m[i]),
            precip: hourly.precipitation_probability[i],
            IconComp,
            isNow,
        };
    });

    return (
        <section className="mb-5">
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                Next 24 Hours
            </h2>
            <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
                {hours.map((h, i) => (
                    <motion.div
                        key={h.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`flex-none w-[72px] rounded-xl border p-3 text-center snap-start transition-colors ${h.isNow
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-card hover:bg-card/80'
                            }`}
                    >
                        <div className="text-xs text-muted-foreground font-medium mb-2">{h.label}</div>
                        <h.IconComp className={`w-6 h-6 mx-auto mb-1.5 ${h.isNow ? 'text-primary' : 'text-foreground/70'}`} />
                        <div className="text-sm font-semibold font-mono">{h.temp}°</div>
                        {h.precip > 0 && (
                            <div className="flex items-center justify-center gap-0.5 mt-1.5 text-primary">
                                <Droplets className="w-3 h-3" />
                                <span className="text-[0.65rem] font-medium">{h.precip}%</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

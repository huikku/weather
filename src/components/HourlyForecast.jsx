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
        <section className="mb-5 lg:mb-8">
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                Next 24 Hours
            </h2>
            {/* Scroll container: increased padding and gap for larger screens */}
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                {hours.map((h, i) => (
                    <motion.div
                        key={h.key}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.015, type: 'spring', stiffness: 200, damping: 20 }}
                        className={`flex-none w-[90px] sm:w-[100px] rounded-2xl border p-3 sm:p-4 text-center snap-start transition-all hover:shadow-md ${h.isNow
                            ? 'border-primary/50 bg-primary/10 shadow-sm shadow-primary/5'
                            : 'border-border bg-card/50 hover:bg-card/90 backdrop-blur-sm'
                            }`}
                    >
                        {/* Time Label */}
                        <div className={`text-xs sm:text-sm font-medium mb-3 ${h.isNow ? 'text-primary' : 'text-muted-foreground'}`}>
                            {h.label}
                        </div>

                        {/* Icon */}
                        <h.IconComp className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 ${h.isNow ? 'text-primary' : 'text-foreground/80'}`} />

                        {/* Temperature */}
                        <div className="text-lg sm:text-xl font-bold font-mono tracking-tighter">
                            {h.temp}°
                        </div>

                        {/* Precipitation */}
                        {h.precip > 0 ? (
                            <div className="flex items-center justify-center gap-1 mt-2 text-sky-400">
                                <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="text-[10px] sm:text-xs font-semibold">{h.precip}%</span>
                            </div>
                        ) : (
                            <div className="h-5 sm:h-6 mt-2" /> /* Spacer to keep heights consistent */
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

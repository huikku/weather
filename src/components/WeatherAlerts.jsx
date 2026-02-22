import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const severityConfig = {
    Extreme: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', Icon: ShieldAlert },
    Severe: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', Icon: AlertTriangle },
    Moderate: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', Icon: AlertTriangle },
    Minor: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', Icon: Info },
    Unknown: { color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border', Icon: Info },
};

export function WeatherAlerts({ alerts }) {
    if (!alerts?.alerts?.length) return null;

    return (
        <section className="mb-5">
            <AnimatePresence>
                {alerts.alerts.map((alert, i) => {
                    const config = severityConfig[alert.severity] || severityConfig.Unknown;
                    const { Icon } = config;

                    return (
                        <motion.div
                            key={alert.id || i}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            transition={{ delay: i * 0.1 }}
                            className={`rounded-xl border ${config.border} ${config.bg} p-4 mb-2 last:mb-0`}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={`w-5 h-5 ${config.color} mt-0.5 shrink-0`} />
                                <div className="min-w-0">
                                    <h3 className={`font-heading font-semibold text-sm ${config.color}`}>
                                        {alert.event}
                                    </h3>
                                    {alert.headline && (
                                        <p className="text-foreground/80 text-xs mt-1 leading-relaxed">
                                            {alert.headline}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </section>
    );
}

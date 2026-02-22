import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function AIReport({ report }) {
    if (!report) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mb-5 overflow-hidden"
        >
            <div className="glass rounded-2xl p-5 glow-primary">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-primary">
                        AI Weather Report
                    </h2>
                </div>
                <p className="text-foreground/90 text-[0.94rem] leading-relaxed">
                    {report}
                </p>
            </div>
        </motion.section>
    );
}

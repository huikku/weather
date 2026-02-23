import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * Parses plain-text weather report and returns React elements
 * with rich inline styling for key terms.
 */
function formatReport(text) {
    if (!text) return null;

    // Order matters — more specific patterns first
    const rules = [
        // Warnings / alerts / hazards — red/amber tones
        {
            pattern: /\b(warning|advisory|watch|alert|hazardous|dangerous|severe|blizzard|tornado|hurricane|flood|ice storm|wind chill|frostbite|life-threatening)\b/gi,
            className: 'font-bold text-red-400',
        },
        // Caution words — amber
        {
            pattern: /\b(caution|slippery|icy|freezing rain|black ice|poor visibility|hazard|gusty|gusts up to \d+ mph)\b/gi,
            className: 'font-semibold text-amber-400',
        },
        // Temperatures (e.g., 28°F, -5°C, mid-40s, upper 50s, low 60s, near zero)
        {
            pattern: /(-?\d+°[FC]?|\b(mid|upper|low|lower|high|near)[- ](\d+s|zero|freezing)\b)/gi,
            className: 'font-bold text-cyan-300',
        },
        // Precipitation — sky blue
        {
            pattern: /\b(rain|snow|sleet|hail|drizzle|showers|flurries|precipitation|accumulating|blowing snow|wintry mix|thunderstorms?|downpour)\b/gi,
            className: 'font-semibold text-sky-400',
        },
        // Wind references
        {
            pattern: /\b(\d+ mph|wind gusts?|breezy|windy|calm winds?|light winds?)\b/gi,
            className: 'font-medium text-teal-300',
        },
        // Days of the week — bold white
        {
            pattern: /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|today|tonight|tomorrow|this morning|this afternoon|this evening|overnight)\b/gi,
            className: 'font-bold text-foreground',
        },
        // Model names — subtle emphasis
        {
            pattern: /\b(NWS|ECMWF|GFS|HRRR|European model)\b/g,
            className: 'font-semibold text-purple-300/80',
        },
    ];

    // Build a single combined regex from all rules
    const combined = rules.map((r, i) => `(?<g${i}>${r.pattern.source})`).join('|');
    const flags = 'gi';
    const masterRegex = new RegExp(combined, flags);

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = masterRegex.exec(text)) !== null) {
        // Push plain text before this match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Find which group matched
        let className = '';
        for (let i = 0; i < rules.length; i++) {
            if (match.groups?.[`g${i}`] !== undefined) {
                className = rules[i].className;
                break;
            }
        }

        parts.push(
            <span key={match.index} className={className}>
                {match[0]}
            </span>
        );

        lastIndex = masterRegex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

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
                    {formatReport(report)}
                </p>
            </div>
        </motion.section>
    );
}


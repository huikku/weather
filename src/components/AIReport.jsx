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
        // Temperatures (e.g., 28°F, 27.8°F, -5°C, mid-40s, upper 50s, low 60s, near zero)
        {
            pattern: /(-?\d+\.?\d*°[FC]?|\b(mid|upper|low|lower|high|near)[- ](\d+s|zero|freezing)\b)/gi,
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
/**
 * Converts temperature values in report text between F and C.
 * Report is always generated in imperial — this converts for display.
 */
function convertReportUnits(text, units) {
    if (!text || units === 'imperial') return text;

    // Convert XX°F → XX°C
    return text.replace(/-?\d+\.?\d*°F/g, (match) => {
        const f = parseFloat(match);
        const c = ((f - 32) * 5 / 9).toFixed(0);
        return `${c}°C`;
    });
}

export function AIReport({ report, units = 'imperial' }) {
    if (!report) return null;

    // Split report into main forecast and tip lines
    const tipPatterns = [
        { emoji: '👔', key: 'dress', label: 'What to Wear', color: 'text-amber-300', bg: 'bg-amber-400/10 border-amber-400/20' },
        { emoji: '🏃', key: 'activities', label: 'Activities', color: 'text-emerald-300', bg: 'bg-emerald-400/10 border-emerald-400/20' },
        { emoji: '🌿', key: 'allergy', label: 'Allergy', color: 'text-lime-300', bg: 'bg-lime-400/10 border-lime-400/20' },
    ];

    let mainText = convertReportUnits(report, units);
    const tips = [];

    for (const tip of tipPatterns) {
        const idx = mainText.indexOf(tip.emoji);
        if (idx !== -1) {
            // Extract the tip line (from emoji to end of that line)
            const lineStart = idx;
            const lineEnd = mainText.indexOf('\n', lineStart);
            const line = lineEnd === -1 ? mainText.slice(lineStart) : mainText.slice(lineStart, lineEnd);

            // Clean the line — remove the emoji and label prefix
            let content = line.slice(tip.emoji.length).trim();
            // Remove "DRESS:", "ACTIVITIES:", "ALLERGY:" prefix if present
            content = content.replace(/^(DRESS|ACTIVITIES|ALLERGY)\s*:\s*/i, '').trim();

            if (content) {
                tips.push({ ...tip, content });
            }

            // Remove the tip line from main text
            mainText = (lineEnd === -1
                ? mainText.slice(0, lineStart)
                : mainText.slice(0, lineStart) + mainText.slice(lineEnd + 1)
            ).trim();
        }
    }

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
                    {formatReport(mainText)}
                </p>

                {/* Tip cards */}
                {tips.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/30">
                        {tips.map((tip) => (
                            <div key={tip.key} className={`rounded-xl border px-3 py-2.5 ${tip.bg}`}>
                                <div className={`text-[0.65rem] uppercase tracking-wider font-semibold mb-1 ${tip.color}`}>
                                    {tip.emoji} {tip.label}
                                </div>
                                <div className="text-foreground/80 text-xs leading-relaxed">
                                    {tip.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.section>
    );
}


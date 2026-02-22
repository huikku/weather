import { useRef, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useGeolocation } from '@/hooks/useGeolocation';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchBar({ onSelect, units, onToggleUnits }) {
    const { query, setQuery, results, isOpen, close, loading } = useSearch();
    const { getLocation, loading: geoLoading } = useGeolocation();
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                close();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [close]);

    const handleSelect = (result) => {
        onSelect({
            lat: result.lat,
            lon: result.lon,
            name: result.name,
            label: result.label,
        });
        close();
        inputRef.current?.blur();
    };

    const handleGeolocate = async () => {
        try {
            const loc = await getLocation();
            onSelect(loc);
        } catch (err) {
            console.error('Geolocation failed:', err);
        }
    };

    return (
        <header className="sticky top-0 z-50 flex items-center gap-2.5 py-3 pb-2 bg-gradient-to-b from-[var(--background)] via-[var(--background)] to-transparent">
            <div ref={containerRef} className="relative flex-1">
                <div className="flex items-center bg-card border border-border rounded-xl px-3.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                    {loading ? (
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
                    ) : (
                        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search city..."
                        autoComplete="off"
                        spellCheck={false}
                        className="flex-1 bg-transparent border-none outline-none text-foreground font-sans text-sm py-2.5 px-2.5 placeholder:text-muted-foreground"
                    />
                    <button
                        onClick={handleGeolocate}
                        disabled={geoLoading}
                        title="Use my location"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                    >
                        {geoLoading ? (
                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                            <MapPin className="w-4.5 h-4.5" />
                        )}
                    </button>
                </div>

                <AnimatePresence>
                    {isOpen && results.length > 0 && (
                        <motion.ul
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full mt-1.5 left-0 right-0 bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xl z-50 max-h-72 overflow-y-auto"
                        >
                            {results.map((r) => (
                                <li
                                    key={r.id}
                                    onClick={() => handleSelect(r)}
                                    className="px-4 py-3 cursor-pointer hover:bg-secondary/60 transition-colors border-b border-border/50 last:border-b-0"
                                >
                                    <div className="text-sm font-medium text-foreground">{r.name}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {[r.admin1, r.country].filter(Boolean).join(', ')}
                                    </div>
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={onToggleUnits}
                title="Toggle units"
                className="bg-card border border-border text-muted-foreground font-heading font-semibold text-sm px-3.5 py-2.5 rounded-xl hover:border-primary hover:text-primary transition-all whitespace-nowrap"
            >
                {units === 'imperial' ? '°F' : '°C'}
            </button>
        </header>
    );
}

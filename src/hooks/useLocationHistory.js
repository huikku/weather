import { useState, useCallback } from 'react';

const STORAGE_KEY = 'weather-history';
const MAX_HISTORY = 8;

function loadHistory() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
}

function saveHistory(history) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useLocationHistory() {
    const [history, setHistory] = useState(loadHistory);

    const addToHistory = useCallback((loc) => {
        if (!loc?.lat || !loc?.lon) return;
        setHistory(prev => {
            // Remove duplicate (same lat/lon rounded to 2 decimals)
            const filtered = prev.filter(h =>
                Math.round(h.lat * 100) !== Math.round(loc.lat * 100) ||
                Math.round(h.lon * 100) !== Math.round(loc.lon * 100)
            );
            const updated = [
                { lat: loc.lat, lon: loc.lon, name: loc.name, label: loc.label },
                ...filtered,
            ].slice(0, MAX_HISTORY);
            saveHistory(updated);
            return updated;
        });
    }, []);

    const removeFromHistory = useCallback((index) => {
        setHistory(prev => {
            const updated = prev.filter((_, i) => i !== index);
            saveHistory(updated);
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return { history, addToHistory, removeFromHistory, clearHistory };
}

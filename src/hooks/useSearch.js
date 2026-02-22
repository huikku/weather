import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchGeocode } from '@/lib/api';

export function useSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    const search = useCallback(async (q) => {
        if (!q || q.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }
        setLoading(true);
        try {
            const data = await fetchGeocode(q);
            setResults(data);
            setIsOpen(data.length > 0);
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(query), 300);
        return () => clearTimeout(debounceRef.current);
    }, [query, search]);

    const close = useCallback(() => {
        setIsOpen(false);
        setResults([]);
        setQuery('');
    }, []);

    return { query, setQuery, results, isOpen, close, loading };
}

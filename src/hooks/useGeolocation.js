import { useState, useCallback } from 'react';

export function useGeolocation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            setLoading(true);
            setError(null);

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        // Reverse geocode to get a place name
                        const res = await fetch(
                            `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1`
                        );
                        // We'll use a simpler approach — just use coords and let NWS or Open-Meteo figure it out
                        resolve({
                            lat: latitude,
                            lon: longitude,
                            name: 'Current Location',
                            label: 'Current Location',
                        });
                    } catch (err) {
                        reject(err);
                    } finally {
                        setLoading(false);
                    }
                },
                (err) => {
                    setLoading(false);
                    setError(err.message);
                    reject(err);
                },
                { enableHighAccuracy: false, timeout: 10000 }
            );
        });
    }, []);

    return { getLocation, loading, error };
}

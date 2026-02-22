export class TTLCache {
    constructor(defaultTTL = 300000) {
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }

    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, { value, expiry: Date.now() + ttl });
    }

    // Round lat/lon to ~1km grid for cache key grouping
    static geoKey(lat, lon, prefix = '') {
        const rlat = Math.round(lat * 100) / 100;
        const rlon = Math.round(lon * 100) / 100;
        return `${prefix}:${rlat},${rlon}`;
    }
}

interface CacheEntry {
    data: any;
    timestamp: number;
}

class NewsCache {
    private cache: Map<string, CacheEntry> = new Map();
    private TTL = 5 * 60 * 1000; // 5 minutes

    set(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    get(key: string): any | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        const isExpired = Date.now() - entry.timestamp > this.TTL;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    clear(): void {
        this.cache.clear();
    }
}

export const newsCache = new NewsCache();


import EncryptUtils from "../utils/EncryptUtils";

console.log("[UrlParamsService] Loading UrlParamsService module...");

class UrlParamsService {
    private static instance: UrlParamsService;
    private readonly paramsCache: Map<string, any> = new Map();

    public static getInstance(): UrlParamsService {
        if (!UrlParamsService.instance) {
            console.log("[UrlParamsService] Creating new UrlParamsService instance");
            UrlParamsService.instance = new UrlParamsService();
        } else {
            console.log("[UrlParamsService] Returning existing UrlParamsService instance");
        }
        return UrlParamsService.instance;
    }

    public parseAndCache(paramName: string): any {
        console.log("🔗 [UrlParamsService] Parsing and caching parameter:", paramName);
        const urlParams = new URLSearchParams(window.location.search);
        console.log("🔗 [UrlParamsService] URL search params:", window.location.search);

        const cacheKey = `${paramName}:${urlParams.get(paramName)}`;
        console.log("🔗 [UrlParamsService] Cache key:", cacheKey);

        if (this.paramsCache.has(cacheKey)) {
            console.log("🔗 [UrlParamsService] Found cached value for:", cacheKey);
            return this.paramsCache.get(cacheKey);
        }

        if (!urlParams.has(paramName)) {
            console.log("🔗 [UrlParamsService] Parameter not found in URL:", paramName);
            return null;
        }

        try {
            const encodedParams = urlParams.get(paramName);
            console.log("🔗 [UrlParamsService] Encoded params:", encodedParams);

            const decodedParams = EncryptUtils.base64Decode(encodedParams);
            console.log("🔗 [UrlParamsService] Decoded params:", decodedParams);

            const parsedParams = JSON.parse(decodedParams);
            console.log("🔗 [UrlParamsService] Parsed params:", parsedParams);

            this.paramsCache.set(cacheKey, parsedParams);
            console.log("🔗 [UrlParamsService] Cached parsed params for key:", cacheKey);

            return parsedParams;
        } catch (error) {
            console.error("🔗 [UrlParamsService] Error parsing URL params:", error.message);
            cc.error(`Error parsing URL params: ${error.message}`);
            return null;
        }
    }

    public clearCache(paramName?: string): void {
        if (paramName) {
            console.log("🔗 [UrlParamsService] Clearing cache for parameter:", paramName);
            let clearedCount = 0;
            this.paramsCache.forEach((value, key) => {
                if (key.startsWith(`${paramName}:`)) {
                    this.paramsCache.delete(key);
                    clearedCount++;
                }
            });
            console.log("🔗 [UrlParamsService] Cleared", clearedCount, "cache entries for parameter:", paramName);
        } else {
            console.log("🔗 [UrlParamsService] Clearing entire cache");
            const cacheSize = this.paramsCache.size;
            this.paramsCache.clear();
            console.log("🔗 [UrlParamsService] Cleared entire cache with", cacheSize, "entries");
        }
    }

    public getCached(paramName: string, encodedValue: string): any {
        const cacheKey = `${paramName}:${encodedValue}`;
        console.log("🔗 [UrlParamsService] Getting cached value for key:", cacheKey);

        const cachedValue = this.paramsCache.get(cacheKey) || null;
        if (cachedValue) {
            console.log("🔗 [UrlParamsService] Found cached value:", cachedValue);
        } else {
            console.log("🔗 [UrlParamsService] No cached value found for key:", cacheKey);
        }

        return cachedValue;
    }
}

export default UrlParamsService;

console.log("[UrlParamsService] UrlParamsService module loaded successfully");

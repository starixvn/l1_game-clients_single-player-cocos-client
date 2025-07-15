import EncryptUtils from "../utils/EncryptUtils";



class UrlParamsService {
    private static instance: UrlParamsService;
    private readonly paramsCache: Map<string, any> = new Map();

    public static getInstance(): UrlParamsService {
        if (!UrlParamsService.instance) {
            
            UrlParamsService.instance = new UrlParamsService();
        } else {
            
        }
        return UrlParamsService.instance;
    }

    public parseAndCache(paramName: string): any {
        
        const urlParams = new URLSearchParams(window.location.search);
        

        const cacheKey = `${paramName}:${urlParams.get(paramName)}`;
        

        if (this.paramsCache.has(cacheKey)) {
            
            return this.paramsCache.get(cacheKey);
        }

        if (!urlParams.has(paramName)) {
            
            return null;
        }

        try {
            const encodedParams = urlParams.get(paramName);
            

            const decodedParams = EncryptUtils.base64Decode(encodedParams);
            

            const parsedParams = JSON.parse(decodedParams);
            

            this.paramsCache.set(cacheKey, parsedParams);
            

            return parsedParams;
        } catch (error) {
            console.error("🔗 [UrlParamsService] Error parsing URL params:", error.message);
            cc.error(`Error parsing URL params: ${error.message}`);
            return null;
        }
    }

    public clearCache(paramName?: string): void {
        if (paramName) {
            
            let clearedCount = 0;
            this.paramsCache.forEach((value, key) => {
                if (key.startsWith(`${paramName}:`)) {
                    this.paramsCache.delete(key);
                    clearedCount++;
                }
            });
            
        } else {
            
            const cacheSize = this.paramsCache.size;
            this.paramsCache.clear();
            
        }
    }

    public getCached(paramName: string, encodedValue: string): any {
        const cacheKey = `${paramName}:${encodedValue}`;
        

        const cachedValue = this.paramsCache.get(cacheKey) || null;
        if (cachedValue) {
            
        } else {
            
        }

        return cachedValue;
    }
}

export default UrlParamsService;



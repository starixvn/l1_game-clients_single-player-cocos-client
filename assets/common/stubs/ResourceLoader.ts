// Stub implementation for ResourceLoader
// This replaces the removed lobby component

export const themeResourceLoader = {
    async loadPrefab(path: string): Promise<cc.Prefab> {
        // Fallback to GameUtils.loadResource
        return null;
    },
    async loadRemoteSharedResource(path: string): Promise<any> {
        // Fallback implementation
        return null;
    }
}; 
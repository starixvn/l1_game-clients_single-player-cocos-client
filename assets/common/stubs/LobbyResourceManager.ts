// Stub implementation for LobbyResourceManager
// This replaces the removed lobby component

export interface IInfoShareResourceBanner {
    version?: string;
    languages?: { [key: string]: boolean };
}

export const lobbyResourceManager = {
    infoShareResource: {
        versionBanner: "1.0.0"
    },
    hasCurrencyGroup(): boolean {
        return false;
    }
}; 

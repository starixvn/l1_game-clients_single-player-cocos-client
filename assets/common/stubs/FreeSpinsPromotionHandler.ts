// Stub implementation for FreeSpinsPromotionHandler
// This replaces the removed lobby component

export class FreeSpinsPromotionHandler {
    private static instance: FreeSpinsPromotionHandler;

    static getInstance(): FreeSpinsPromotionHandler {
        if (!FreeSpinsPromotionHandler.instance) {
            FreeSpinsPromotionHandler.instance = new FreeSpinsPromotionHandler();
        }
        return FreeSpinsPromotionHandler.instance;
    }

    setPromotionInfoFromSso(promotionInfo: any): void {
        // Stub implementation
    }

    getFreeSpinsPromotionUrl(): string {
        return "";
    }

    getStorageKey(): string {
        return "freeSpinsPromotion";
    }

    get isDirectlyOpen(): boolean {
        return false;
    }

    getGameId(): number {
        return 0;
    }

    onCloseFreeSpinsPromotionPopup(): void {
        // Stub implementation
    }
}

export const freeSpinsPromotionHandler = FreeSpinsPromotionHandler.getInstance(); 

// Stub implementation for PromotionTournamentHandler
// This replaces the removed lobby component

export class PromotionTournamentHandler {
    private static instance: PromotionTournamentHandler;

    static getInstance(): PromotionTournamentHandler {
        if (!PromotionTournamentHandler.instance) {
            PromotionTournamentHandler.instance = new PromotionTournamentHandler();
        }
        return PromotionTournamentHandler.instance;
    }

    getListPromotionUrl(): string {
        return "";
    }

    onClosePromotionTournamentPopup(): void {
        // Stub implementation
    }

    checkTournamentPromotionsBeforeSignIn(): void {
        // Stub implementation
    }
}

export const promotionTournamentHandler = PromotionTournamentHandler.getInstance(); 

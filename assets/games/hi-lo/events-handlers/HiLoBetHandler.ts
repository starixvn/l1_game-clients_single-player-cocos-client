import GameBaseBetHandler from "../../_base/handlers/GameBaseBetHandler";

export default class HiLoBetHandler extends GameBaseBetHandler {
    handle(data: any): boolean {
        super.handle(data);
        this.handleEndDeal(data);
        return false;
    }

    handleEndDeal(data) {
        if (data.endDeal) {
            this.main.showProcessingWarning(false);
        }
    }
}

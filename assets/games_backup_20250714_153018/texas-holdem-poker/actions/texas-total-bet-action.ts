import { updateTotalBetLabel } from "./texas-place-bet-actions";
import TexasPlaceBetModel from "./../event-models/texas-place-bet-model";
import TexasMicroUIAction from "./texas-microUI-action";

const { ccclass } = cc._decorator;

@ccclass
export default class TexasTotalBetAction extends TexasMicroUIAction {
    handleUI() {
        const totalBetLabel = this.nodeTree.getComponent(cc.Label);
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.PLACE_BET, updateTotalBetLabel(totalBetLabel));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.DOUBLE, updateTotalBetLabel(totalBetLabel));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.CLEAR_BETS, updateTotalBetLabel(totalBetLabel));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.CALL, updateTotalBetLabel(totalBetLabel));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.TURN, updateTotalBetLabel(totalBetLabel));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.RIVER, updateTotalBetLabel(totalBetLabel));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.UPDATE_TOTAL_BET, updateTotalBetLabel(totalBetLabel));
    }
}

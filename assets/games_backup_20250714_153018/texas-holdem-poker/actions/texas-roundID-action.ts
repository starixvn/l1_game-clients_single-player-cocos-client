import TexasOwnBetModel from "../event-models/texas-own-bet-model";
import TexasMicroUIAction from "./texas-microUI-action";

const { ccclass } = cc._decorator;

@ccclass
export default class TexasRoundIDAction extends TexasMicroUIAction {
    handleUI() {
        this.gameData.ownBets.on(TexasOwnBetModel.Events.ROUNDID_CHANGE, (roundId) => {
            this.nodeTree.getComponent(cc.Label).string = `#${roundId}`;
        });
    }
    clearRoundID() {
        this.nodeTree.getComponent(cc.Label).string = "";
    }
}

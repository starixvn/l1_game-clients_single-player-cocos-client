import { appManager } from "../../../managers/AppManager";
import MD5Component from "../../_base/view-models/MD5Component";
import { clearChipsForLostChoices } from "../../_base_new/actions/NewPayChipsAction";
import MegaKeno from "./MegaKeno";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaKenoSubGame extends MegaKeno {
    //#region override some properties to hide them
    @property({ visible: false, override: true })
    players: any[] = [];

    @property({ visible: false, override: true })
    otherPlayers: cc.Node = null;

    @property({ visible: false, override: true })
    userName: cc.Label = null;

    @property({ visible: false, override: true })
    userAvatar: cc.Sprite = null;

    @property({ visible: false, override: true })
    winningPlayerEffectPrefab: cc.Prefab = null;

    @property({ visible: false, override: true })
    md5Component: MD5Component = null;

    @property({ visible: false, override: true })
    musicBg: cc.AudioSource = null;

    public showOtherPlayerChips = false;

    customShowResultDuration() {
        this.showResultDuration = 8;
        if (this.isMiniKeno(this.gameId)) {
            this.showResultDuration = 6;
        }
    }

    handleAfterSettlementResult(settlement: any, animated: boolean) {
        this.gameData.roundHistory.update();
        this.gameData.resultHash.updateUI();
        this.gameData.settlement.showStatus();
        this.betItems.forEach((betItem) => betItem.setHighlight(settlement.settlementResult[betItem.node.name.toLowerCase()], true));
        clearChipsForLostChoices(this, settlement.settlementResult);
        this.settlementEndResult && this.settlementEndResult.showResult(settlement);
    }

    showStatus(status: any) {
        if (!appManager.GAME_IS_SHOWED) {
            return;
        }

        const { win, bet } = status;

        if (win) {
            this.showWinningBet(bet);
            this.updateUserBalance();
        }
    }
}

import { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import { Orientation } from "./Orientation";
import SocketIOTableGameBase from "./SocketIOTableGameBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiOrientationGame extends SocketIOTableGameBase {
    @property({ type: cc.Enum(Orientation) })
    orientation = Orientation.Landscape;

    public onCurrentBetChange = (bet: number) => {};
    public changeOrirentationCallback = () => {};
    public getCurrentBet = () => {
        return this.betChips ? this.betChips.getCurrentBet() : 0;
    };

    onDestroy() {
        this.clearIntervalAndTimeout();
    }

    onClickChangeOrientation() {
        this.changeOrirentationCallback();
    }

    createCommonBetData() {
        const betData = super.createCommonBetData();
        this.addOrientationData(betData);
        return betData;
    }

    protected onChangedBetChip(bet) {
        super.onChangedBetChip(bet);
        this.onCurrentBetChange(bet);
    }

    public updateDisplayForRemoteConfig() {
        super.updateDisplayForRemoteConfig();
        if (this.node.activeInHierarchy) {
            this.betChips.setSelectedIndexAndScroll(this.getCurrentBet().toString());
        }
    }

    initEventForInGameMenu() {
        const node = super.initEventForInGameMenu();

        node.on(InGameMenuEvents.CHANGE_ORIENTATION, this.onClickChangeOrientation, this);

        return node;
    }
}

import GameUtils from "../../common/GameUtils";
import CustomeRoundTimerResult from "./CustomeRoundTimerResult";
import { GameRoundTimerData } from "./RoundTimerData";
import RoundTimerResultText from "./RoundTimerResultText";

const { ccclass, property } = cc._decorator;

export enum RoundTimerResultType {
    TEXT = 0,
    SPRITE
}

@ccclass
export default class RoundTimerResult extends cc.Component {
    @property({ type: cc.Enum(RoundTimerResultType) })
    resultType = RoundTimerResultType.TEXT;

    @property({
        type: cc.Prefab,
        visible: function (this: RoundTimerResult) {
            return this.resultType === RoundTimerResultType.SPRITE;
        }
    })
    customResultPrefab: cc.Prefab = null;

    public betOptions: string[] = [];
    private customResultNode: cc.Node = null;

    async initCustomResult() {
        try {
            if (this.resultType === RoundTimerResultType.TEXT) {
                this.customResultPrefab = await GameUtils.loadResource(`minipanel/popup-mini-game/RoundTimerResultText`);
            }

            this.customResultNode = GameUtils.createNodeFromPrefab(this.customResultPrefab);
            this.node?.addChild(this.customResultNode);
        } catch (e) {
            cc.log(e);
        }
    }

    setResult(data: GameRoundTimerData) {
        if (!this.customResultNode) {
            return;
        }
        this.resultType === RoundTimerResultType.TEXT ? this.loadText(data) : this.loadCustomResult(data);
    }

    private loadCustomResult(data: GameRoundTimerData) {
        const customResult = this.customResultNode.getComponent(CustomeRoundTimerResult);
        customResult.show(data);
    }

    private loadText(data: GameRoundTimerData) {
        const customResult = this.customResultNode.getComponent(RoundTimerResultText);
        customResult.show(data, this.betOptions);
    }
}

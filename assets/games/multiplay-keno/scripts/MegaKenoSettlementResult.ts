import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import KenoSettlementWinChoices from "../../mini-keno/view-models/KenoSettlementWinChoices";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaKenoSettlementResult extends cc.Component {
    @property(cc.Animation)
    animation: cc.Animation = null;

    @property(cc.Node)
    numberContainer: cc.Node = null;

    @property(KenoSettlementWinChoices)
    settlementChoices: KenoSettlementWinChoices = null;

    @property(cc.Label)
    totalLabel: cc.Label = null;

    @property()
    drawingBallDelay = 1;

    @property()
    drawingBallDuration = 4;

    @property(cc.AudioClip)
    rollingBallsClip: cc.AudioClip = null;

    numberLabels: cc.Label[] = [];

    protected appearanceOrderNumbers: number[];
    protected rollingSoundId: number;

    onLoad() {
        if (this.numberContainer) {
            this.numberLabels = this.numberContainer.getComponentsInChildren(cc.Label);
        }
    }

    onDestroy() {
        this.rollingSoundId && AudioManager.getInstance().stopSFX(this.rollingSoundId);
    }

    hide() {
        GameUtils.hideNode(this.node, 0.3);
    }

    show() {
        this.node.active = true;
        this.node.opacity = 255;
    }

    playResultAnimation(settlement: any, onComplete: () => void) {
        this.show();

        const { result, settlementResult } = settlement;

        this.totalLabel && (this.totalLabel.string = "");
        this.setResultsNumber(result);
        this.settlementChoices.setSettlement(settlementResult);

        this.scheduleOnce(this.startCountTotal, this.drawingBallDelay);
        this.animation.clear();
        this.animation.on("finished", onComplete);
        this.animation.play();
        this.rollingBallsClip && (this.rollingSoundId = AudioManager.getInstance().playSFX(this.rollingBallsClip));
    }

    startCountTotal() {
        if (!this.totalLabel) {
            return;
        }

        let index = 1;
        let total = this.appearanceOrderNumbers[0];
        this.totalLabel.string = total.toString();
        const repeatTime = this.appearanceOrderNumbers.length - 1;
        const drawingStepDelay = this.drawingBallDuration / repeatTime;
        cc.tween(this.node)
            .repeat(
                repeatTime,
                cc
                    .tween()
                    .delay(drawingStepDelay)
                    .call(() => {
                        if (index >= this.appearanceOrderNumbers.length) {
                            console.warn("wrong index in appearanceOrderNumbers ", index);
                            return;
                        }
                        total += this.appearanceOrderNumbers[index];
                        this.totalLabel.string = total.toString();
                        index++;
                    })
            )
            .start();
    }

    setResultsNumber(results: number[]) {
        this.appearanceOrderNumbers = [...results];
        const half = results.length / 2;
        results.forEach((result, index) => {
            const isLeft = index < half;
            const labelIndex = isLeft ? index * 2 : (results.length - 1 - index) * 2 + 1;
            this.numberLabels[labelIndex].string = result.toString();
            this.appearanceOrderNumbers[labelIndex] = result;
        });
    }

    showResult(settlement: any) {
        this.show();
        const { result, settlementResult } = settlement;
        let total = 0;
        result.forEach((item) => {
            total += item;
        });
        this.totalLabel && (this.totalLabel.string = total.toString());
        this.settlementChoices.setSettlement(settlementResult);
    }
}

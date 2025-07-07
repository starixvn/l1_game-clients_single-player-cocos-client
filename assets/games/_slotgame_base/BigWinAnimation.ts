import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator;

interface BigWinType {
    amount: number;
    duration?: number;
    delayTime?: number;
    noZeroSuffix?: boolean;
}

@ccclass
export default class BigWinAnimation extends cc.Component {
    @property(cc.Label)
    amountLabel: cc.Label = null;

    gameId = -1;

    setAmount(data: BigWinType) {
        const { amount } = data;
        const duration = data.duration ?? 0;
        const delayTime = data.delayTime ?? 0;
        const noZeroSuffix = data.noZeroSuffix ?? false;

        cc.tween(this.amountLabel.node)
            .delay(delayTime)
            .call(() => GameUtils.floatToNumber({ label: this.amountLabel, amount, duration, noZeroSuffix: noZeroSuffix }))
            .start();
    }

    async setAmountSlow(amount: number, onComplete: () => void) {
        await GameUtils.floatToNumber2({ label: this.amountLabel, amount });
        onComplete();
    }
}

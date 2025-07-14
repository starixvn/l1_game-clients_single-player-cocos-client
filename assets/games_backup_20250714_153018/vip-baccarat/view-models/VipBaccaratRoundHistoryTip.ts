import GameUtils from "../../../common/GameUtils";

import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";

const { ccclass } = cc._decorator;

type itemType = {
    card: number;
    type: number;
};

@ccclass
export default class VipBaccaratRoundHistoryTip extends MiniRoundHistoryTip {
    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;

        const player = data.player;
        const banker = data.banker;

        let totalPlayer = 0;
        let totalBanker = 0;
        player.forEach((item: itemType) => {
            totalPlayer += this.setValueCard(item.card + 1);
        });

        banker.forEach((item: itemType) => {
            totalBanker += this.setValueCard(item.card + 1);
        });

        const playerText = GameUtils.getBetChoiceString("player");
        const bankerText = GameUtils.getBetChoiceString("banker");
        this.result.string = `${playerText}: ${this.setPoint(totalPlayer)} - ${bankerText}: ${this.setPoint(totalBanker)}`;
        this.show();
    }

    private setPoint(point) {
        return point % 10;
    }

    private setValueCard(value: number) {
        return value >= 10 ? 0 : value;
    }
}

import BetChips from "../../../common/bet-chips/view-models/BetChips";
import ChipViewNew from "../../../common/bet-chips/view-models/ChipViewNew";
import GameUtils from "../../../common/GameUtils";

export default class BlackJackUtils {
    public static getValues(rank: string): number[] {
        switch (rank) {
            case "A":
                return [1, 11];
            case "J":
            case "Q":
            case "K":
                return [10];
            default:
                return [+rank];
        }
    }

    public static getTotal(cards: any[], cardNum: number): number[] {
        let total = 0;
        let hasAce = false;
        cards.forEach((card, index) => {
            if (index >= cardNum) {
                return;
            }
            if (card.rank === "A") {
                hasAce = true;
            }
            total += BlackJackUtils.getValues(card.rank)[0];
        });
        if (hasAce && total + 10 < 22) {
            return [total, total + 10];
        }
        return [total];
    }

    public static createChipStack(bet: number, betChips: BetChips, shadowFrame: cc.SpriteFrame, skewX: number, isChip3D: boolean) {
        return GameUtils.createChipStack(bet, betChips, { isChip3D: isChip3D, shadowFrame: shadowFrame, skewX: skewX });
    }

    public static shakeChipAnim(propertiesChip: ChipViewNew, chipFly: any) {
        cc.tween(propertiesChip)
            .to(0.2, {
                rotation: chipFly.rotationComp2,
                scaleX: chipFly.scaleX1,
                scaleY: chipFly.scaleY1,
                rotationNode: chipFly.rotationNode1
            })
            .to(0.2, { rotationNode: chipFly.rotationNode3, scaleX: chipFly.scaleX2, scaleY: chipFly.scaleY2 })
            //.to(0.1, { rotationNode: chipFly.rotationNode3 })

            .to(0.05, { skewY: -5 })
            .to(0.1, { skewY: 5 })
            .to(0.05, { skewY: 0 })
            .start();
    }
}

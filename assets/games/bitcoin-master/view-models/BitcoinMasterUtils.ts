import { numberWithCommas } from "../../../common/helpers/NumberHelper";

export default class BitcoinMasterUtils {
    public static getEvenOddResult(value: number): string {
        const result = value.toString().split(".")[0];
        return result.slice(-1);
    }

    public static getUpDownResult(result: any): number {
        return result.close - result.open;
    }

    public static absResult(result: number): string {
        return numberWithCommas(Math.abs(result).toFixed(2), 2, false);
    }

    public static formattingBitcoinValue(result: number): string {
        return numberWithCommas(result.toFixed(2), 2, false);
    }

    public static calcGrossWinLoss(log: any): number {
        const { amount, refund, betwin, win } = log;
        if (win) {
            return amount - refund + betwin;
        } else {
            return 0;
        }
    }

    public static setGrossWinLoss(data: any): number {
        let winloss = 0;
        data.betLogDetails.forEach((log) => {
            winloss += this.calcGrossWinLoss(log);
        });
        return winloss;
    }

    public static moveAnimation(duration: number, node: cc.Node, toPosition: cc.Vec3, fromPosition: cc.Vec3) {
        node.position = fromPosition;
        node.opacity = 0;
        node.scale = 0.5;
        const showTime = 0.2;
        const moveTime = duration - showTime;
        cc.tween(node)
            .to(moveTime, { opacity: 150, position: toPosition, scale: 1 }, { easing: "sineOut" })
            .to(showTime, { opacity: 255 }, { easing: "sineIn" })
            .start();
    }

    public static convertCurrentBitcoinPosition(node: cc.Node, destNode: cc.Node): cc.Vec3 {
        return destNode.parent.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v3(0, 0, 0)));
    }
}

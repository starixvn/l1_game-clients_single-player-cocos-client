import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { systemType } from "../../../configs/Configs";
import { SystemType } from "../../../ISystem";
import BalancedBettingPoolBetItemBase from "../BalancedBettingPoolBetItemBase";
import BalancedBettingPoolGameBase from "../BalancedBettingPoolGameBase";
import GameTicketDetailBase from "./GameTicketDetailBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameBalancedBettingHistoryBase extends GameTicketDetailBase {
    @property(cc.Label)
    roundIdLabel: cc.Label = null;

    @property(cc.Label)
    leftBetAmount: cc.Label = null;

    @property(cc.Label)
    leftRefundAmount: cc.Label = null;

    @property(cc.Label)
    rightBetAmount: cc.Label = null;

    @property(cc.Label)
    rightRefundAmount: cc.Label = null;

    @property(cc.Node)
    leftContent: cc.Node = null;

    @property(cc.Node)
    rightContent: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    nextButton: cc.Node = null;

    @property(cc.Node)
    leftResultNode: cc.Node = null;

    @property(cc.Node)
    rightResultNode: cc.Node = null;

    protected main: BalancedBettingPoolGameBase;
    protected roundId = 0;
    protected data: any;

    onLoad() {
        GameUtils.setFontSizeLabelsInNode(this.node);
        this.leftContent.children.forEach((child) => child.destroy());
        this.rightContent.children.forEach((child) => child.destroy());
        this.updateTitle();
    }

    init(main: BalancedBettingPoolGameBase, roundId: number) {
        this.main = main;
        this.roundId = roundId;

        this.getRound(this.roundId);
    }

    onDisable() {
        this.node.destroy();
    }

    onNextClick() {
        this.getRound(this.roundId + 1);
    }

    onPreviousClick() {
        this.getRound(this.roundId - 1);
    }

    getRound(roundId: number) {
        this.main.socket.emit("getRound", { roundId });
    }

    addItem(data: any, userRate: number, index: number) {
        const item = cc.instantiate(this.itemPrefab);
        const itemComponent = item.getComponent(BalancedBettingPoolBetItemBase);
        itemComponent.setData(data, userRate, index);
        return item;
    }

    resetBettingUserList() {
        this.leftContent.destroyAllChildren();
        this.rightContent.destroyAllChildren();
    }

    onData(data: any) {
        this.resetBettingUserList();
        this.data = data;
        this.roundId = data.id;
        this.nextButton.active = this.main && this.main.currentDataLogs[0].roundId > data.id;
    }

    loadBettingUserList(leftBetType: string, rightBetType: string) {
        this.highLightWinningTitle(leftBetType, rightBetType);
        this.loadData(leftBetType, this.leftContent, this.leftBetAmount, this.leftRefundAmount);
        this.loadData(rightBetType, this.rightContent, this.rightBetAmount, this.rightRefundAmount);
    }

    protected highLightWinningTitle(leftBetType: string, rightBetType: string) {
        this.leftResultNode.opacity = this.data.settlementResult[leftBetType] ? 255 : 100;
        this.rightResultNode.opacity = this.data.settlementResult[rightBetType] ? 255 : 100;
    }

    loadData(choice: string, containerNode: cc.Node, betAmountLabel: cc.Label, refundLabel: cc.Label) {
        if (this.data[choice] && this.itemPrefab) {
            this.data[choice].forEach((user, index) => {

                const item = this.addItem(user, this.data.playerRate, index);
                containerNode.addChild(item);
            });
        }

        this.setAmount(this.data.total[choice], betAmountLabel, refundLabel, this.data.playerRate);
    }

    private getMultiplierForTicket(isOldTicketData = false) {
        return systemType === SystemType.SC2 && isOldTicketData ? 1000 : 1;
    }

    setAmount(total: any, betAmountLabel: cc.Label, refundLabel: cc.Label, userRate: number) {
        let betAmount = 0;
        let refund = 0;

        if (total) {
            betAmount = total.betAmount;
            refund = total.refund;
        }

        const convertBetAmount = GameUtils.getTicketValueByCurrency(betAmount || 0, userRate);
        const convertRefund = GameUtils.getTicketValueByCurrency(refund || 0, userRate);
        betAmountLabel.string = numberWithCommas(convertBetAmount, 2);
        refundLabel.string = numberWithCommas(convertRefund, 2);
    }
}

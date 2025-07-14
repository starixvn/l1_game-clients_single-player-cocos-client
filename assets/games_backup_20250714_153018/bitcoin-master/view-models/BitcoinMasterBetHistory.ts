import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import ItemContentMenu from "../../../common/helpers/Menu/ItemContentMenu";
import GameBalancedBettingHistoryBase from "../../_base/view-models/GameBalancedBettingHistoryBase";
import { BMBetType, BMHeaderMenu } from "./BitcoinMasterCommon";
import BitcoinMasterEvenOddResultDetail from "./BitcoinMasterEvenOddResultDetail";
import BitcoinMasterGapAmount from "./BitcoinMasterGapAmount";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterBetHistory extends GameBalancedBettingHistoryBase {
    @property(cc.Node)
    header: cc.Node = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    openValue: cc.Label = null;

    @property(cc.Label)
    closeValue: cc.Label = null;

    @property(BitcoinMasterGapAmount)
    gapAmountComp: BitcoinMasterGapAmount = null;

    @property(cc.Node)
    generalInfoNode: cc.Node = null;

    @property(cc.Label)
    evenOddResult: cc.Label = null;

    @property(BitcoinMasterEvenOddResultDetail)
    evenOddResultDetail: BitcoinMasterEvenOddResultDetail = null;

    @property(cc.Node)
    titleNode: cc.Node = null;

    protected activeTab = BMHeaderMenu.UpDown;

    HEIGHT_BET_DETAIL_TABLE = 317;
    WIDTH_BET_DETAIL_TABLE = 516;

    start() {
        // do not show game name on title
    }

    onData(data: any) {
        super.onData(data);
        this.roundIdLabel.string = `#${data.id}`;
        this.time.string = getStringDateByTime(data.time);
        this.activeTab === BMHeaderMenu.UpDown ? this.loadUpDownData() : this.loadEvenOddData();
    }

    setDefaultView(view: BMHeaderMenu) {
        this.activeTab = view;
        this.header.children.forEach((header) => {
            const menuComponent = header.getComponent(ItemContentMenu);

            if (header.name === view) {
                menuComponent.select();
            } else {
                menuComponent.unselect();
            }
        });
    }

    onSelectHeader(event, name) {
        this.header.children.forEach((header) => {
            const menuComponent = header.getComponent(ItemContentMenu);

            if (header.name === name) {
                this.activeTab = name;
                menuComponent.select();
            } else {
                menuComponent.unselect();
            }
        });

        name === BMHeaderMenu.UpDown ? this.loadUpDownData() : this.loadEvenOddData();
    }

    loadUpDownData() {
        this.resetBettingUserList();

        this.generalInfoNode.getChildByName(BMHeaderMenu.UpDown).active = true;
        this.generalInfoNode.getChildByName(BMHeaderMenu.EvenOdd).active = false;

        const { result } = this.data;
        this.openValue.string = BitcoinMasterUtils.formattingBitcoinValue(result.open);
        this.closeValue.string = BitcoinMasterUtils.formattingBitcoinValue(result.close);
        this.gapAmountComp && this.gapAmountComp.setData(result);

        this.showUpDownTitle(true);
        this.loadBettingUserList(BMBetType.Up, BMBetType.Down);
    }

    loadEvenOddData() {
        this.resetBettingUserList();

        this.generalInfoNode.getChildByName(BMHeaderMenu.UpDown).active = false;
        this.generalInfoNode.getChildByName(BMHeaderMenu.EvenOdd).active = true;

        this.evenOddResult.string = BitcoinMasterUtils.formattingBitcoinValue(this.data.result.close);
        if (this.evenOddResultDetail) {
            this.evenOddResultDetail.setData(this.data.result.close);
            this.evenOddResultDetail.setColor();
        }

        this.showUpDownTitle(false);
        this.loadBettingUserList(BMBetType.Even, BMBetType.Odd);
    }

    showUpDownTitle(show = true) {
        this.titleNode.getChildByName(BMBetType.Up).active = show;
        this.titleNode.getChildByName(BMBetType.Down).active = show;
        this.titleNode.getChildByName(BMBetType.Even).active = !show;
        this.titleNode.getChildByName(BMBetType.Odd).active = !show;
    }

    protected highLightWinningTitle(leftBetType: string, rightBetType: string) {
        this.titleNode.getChildByName(leftBetType).opacity = this.data.settlementResult[leftBetType] ? 255 : 100;
        this.titleNode.getChildByName(rightBetType).opacity = this.data.settlementResult[rightBetType] ? 255 : 100;
    }
}

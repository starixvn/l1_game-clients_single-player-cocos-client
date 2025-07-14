import GameUtils from "../../../common/GameUtils";
import ItemContentMenu from "../../../common/helpers/Menu/ItemContentMenu";
import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import GameBase from "../../_base/GameBase";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import { BMBetType, BMHeaderMenu, BMStatisticData } from "./BitcoinMasterCommon";
import BitcoinMasterStatisticItem from "./BitcoinMasterStatisticItem";
import BitcoinMasterStatisticPercent from "./BitcoinMasterStatisticPercent";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterStatistic extends cc.Component {
    @property(cc.Node)
    header: cc.Node = null;

    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    @property(BitcoinMasterStatisticPercent)
    leftPercent: BitcoinMasterStatisticPercent = null;

    @property(BitcoinMasterStatisticPercent)
    rightPercent: BitcoinMasterStatisticPercent = null;

    @property(CommonDialog)
    dialog: CommonDialog = null;

    activeTab = BMHeaderMenu.UpDown;
    upDownStatistic: BMStatisticData = { left: { name: "", value: 0 }, right: { name: "", value: 0 } };
    evenOddStatistic: BMStatisticData = { left: { name: "", value: 0 }, right: { name: "", value: 0 } };
    data: any = null;

    onLoad() {
        this.dialog.addOnDidHide(() => this.node.destroy());
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

    init(main: GameBase) {
        const condition = () => {
            return main.currentTimeRemaining > main.config.betTime;
        };
        this.logControl.init(condition);
    }

    setData(currentDataLogs: any) {
        this.data = [...currentDataLogs];
        this.data.reverse();
        this.calculateStatisticPercent();
        this.activeTab === BMHeaderMenu.UpDown ? this.loadUpDownData() : this.loadEvenOddData();
    }

    private setUpDownRoundHistoryItemData() {
        const data = this.data;
        const logData = data.map((d) => {
            const result = BitcoinMasterUtils.getUpDownResult(d.result);

            if (result === 0) {
                return 0;
            } else {
                if (result > 0) {
                    return 1;
                } else {
                    return 2;
                }
            }
        });
        this.logControl.setData(logData);
        const items = this.logControl.content.getComponentsInChildren(BitcoinMasterStatisticItem);
        items.forEach((item, i) => item.setUpDownValue(data[i].result));
    }

    private setEvenOddRoundHistoryItemData() {
        const data = this.data;
        const logData = data.map((d) => {
            const result = parseFloat(BitcoinMasterUtils.getEvenOddResult(d.result.close));
            return result % 2 ? 1 : 0;
        });
        this.logControl.setData(logData);
        const items = this.logControl.content.getComponentsInChildren(BitcoinMasterStatisticItem);
        items.forEach((item, i) => item.setEvenOddValue(data[i].result));
    }

    calculateStatisticPercent() {
        const total = this.data.length;

        if (total === 0) {
            this.setStatisticData(0, 0, 0, 0);
        }

        let upCount = 0;
        let downCount = 0;
        let evenCount = 0;
        let oddCount = 0;
        let upPecent = 0;
        let downPecent = 0;
        let evenPecent = 0;
        let oddPecent = 0;

        this.data.map((log) => {
            Object.keys(log.settlementResult).forEach((key) => {
                if (log.settlementResult[key]) {
                    switch (key) {
                        case BMBetType.Up:
                            upCount += 1;
                            break;
                        case BMBetType.Down:
                            downCount += 1;
                            break;
                        case BMBetType.Even:
                            evenCount += 1;
                            break;
                        case BMBetType.Odd:
                            oddCount += 1;
                            break;
                    }
                }
            });
        });

        upPecent = Math.round((upCount * 100) / total);
        downPecent = Math.round((downCount * 100) / total);
        evenPecent = Math.round((evenCount * 100) / total);
        oddPecent = Math.round((oddCount * 100) / total);

        this.setStatisticData(upPecent, downPecent, evenPecent, oddPecent);
    }

    setStatisticData(upValue, downValue, evenValue, oddValue) {
        const upDownStatisticData = {
            left: {
                name: GameUtils.getBetChoiceString(BMBetType.Up),
                value: upValue
            },
            right: {
                name: GameUtils.getBetChoiceString(BMBetType.Down),
                value: downValue
            }
        };
        this.upDownStatistic = upDownStatisticData;

        const evenOddStatisticData = {
            left: {
                name: GameUtils.getBetChoiceString(BMBetType.Even),
                value: evenValue
            },
            right: {
                name: GameUtils.getBetChoiceString(BMBetType.Odd),
                value: oddValue
            }
        };
        this.evenOddStatistic = evenOddStatisticData;
    }

    updateStatisticLabels(data: BMStatisticData) {
        this.leftPercent.setData(data.left.name, data.left.value);
        this.rightPercent.setData(data.right.name, data.right.value);
    }

    loadUpDownData() {
        this.updateStatisticLabels(this.upDownStatistic);
        const color = cc.Color.WHITE;
        this.leftPercent.setColor(color.fromHEX("#c4f738"));
        this.rightPercent.setColor(color.fromHEX("#f3485f"));
        this.logControl && this.setUpDownRoundHistoryItemData();
    }

    loadEvenOddData() {
        this.updateStatisticLabels(this.evenOddStatistic);
        const color = cc.Color.WHITE;
        this.leftPercent.setColor(color.fromHEX("#bac5ca"));
        this.rightPercent.setColor(color.fromHEX("#F3485F"));
        this.logControl && this.setEvenOddRoundHistoryItemData();
    }
}

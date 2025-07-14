import AudioManager from "../../../common/audio/AudioManager";
import SedieRoundHistory from "../../../common/round-history/sedie/SedieRoundHistory";
import GameBase from "../../_base/GameBase";
import VipSedieWarRoundHistoryItem from "./VipSedieWarRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VipSedieWarStatistic extends cc.Component {
    @property(SedieRoundHistory)
    sedieRoundHistory: SedieRoundHistory = null;

    @property(cc.Node)
    sedieNode: cc.Node = null;

    @property(cc.Node)
    warNode: cc.Node = null;

    @property(cc.Node)
    totalNode: cc.Node = null;

    @property(cc.Node)
    sedieModeItems: cc.Node[] = [];

    @property({
        type: cc.Label,
        visible: function (this: VipSedieWarStatistic) {
            return this.warNode != null;
        }
    })
    playerValue: cc.Label = null;

    @property({
        type: cc.Label,
        visible: function (this: VipSedieWarStatistic) {
            return this.warNode != null;
        }
    })
    bankerValue: cc.Label = null;

    @property({
        type: cc.Label,
        visible: function (this: VipSedieWarStatistic) {
            return this.warNode != null;
        }
    })
    tieValue: cc.Label = null;

    @property({
        type: cc.Node,
        visible: function (this: VipSedieWarStatistic) {
            return this.warNode != null;
        }
    })
    warModeItems: cc.Node[] = [];

    @property({
        type: cc.Label,
        visible: function (this: VipSedieWarStatistic) {
            return this.totalNode != null;
        }
    })
    totalOddValue: cc.Label = null;

    @property({
        type: cc.Label,
        visible: function (this: VipSedieWarStatistic) {
            return this.totalNode != null;
        }
    })
    totalEvenValue: cc.Label = null;

    @property
    currentMode = 0;

    private readonly suffix: string = "%";
    private data: any;

    private readonly PlayerSedie = 0;
    private readonly BankerSedie = 1;
    private readonly WarMode = 2;
    private readonly TotalMode = 3;

    public init(main: GameBase) {
        this.sedieRoundHistory.init(main);
    }

    public setData(data: any) {
        this.data = data;
        this.updateDisplay();
    }

    onModeChanged(e, mode) {
        AudioManager.getInstance().playClick();

        const newMode = +mode;
        if (this.currentMode === newMode) {
            return;
        }

        this.currentMode = newMode;
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.sedieNode) {
            this.sedieNode.active = false;
        }

        if (this.warNode) {
            this.warNode.active = false;
        }

        if (this.totalNode) {
            this.totalNode.active = false;
        }

        switch (this.currentMode) {
            case this.PlayerSedie:
                this.updatePlayerSedieMode();
                break;
            case this.BankerSedie:
                this.updateBankerSedieMode();
                break;
            case this.WarMode:
                this.updateWarMode();
                break;
            case this.TotalMode:
                this.updateTotalMode();
                break;
        }
    }

    updatePlayerSedieMode() {
        this.updateSedieMode(true);
    }

    updateBankerSedieMode() {
        this.updateSedieMode(false);
    }

    updateSedieMode(isPlayer: boolean) {
        if (this.sedieNode) {
            this.sedieNode.active = true;
        }

        const historyData = this.data.map((d) => {
            let count = 0;
            const list = ["red1", "red2", "red3", "red4"];
            list.forEach((i) => {
                if (isPlayer ? d.result.player[i] : d.result.banker[i]) {
                    count++;
                }
            });
            return count;
        });

        if (this.sedieRoundHistory) {
            this.sedieRoundHistory.logControl.items = this.sedieModeItems;
            this.sedieRoundHistory.setData(historyData);
        }
    }

    updateWarMode() {
        if (this.warNode) {
            this.warNode.active = true;
        }

        const historyData = this.data.map((d) => {
            const list = ["player", "banker", "tie"];
            return this.getValueValid(list, d);
        });
        this.updateWarModeStatistic(historyData);

        if (this.sedieRoundHistory) {
            this.sedieRoundHistory.logControl.items = this.warModeItems;
            this.sedieRoundHistory.logControl.setData(historyData.reverse());
        }
    }

    getValueValid(list: string[], data: any) {
        let result = 0;
        list.forEach((key, index) => {
            if (data.settlementResult[key]) {
                result = index;
            }
        });

        return result;
    }

    updateWarModeStatistic(data: any) {
        const total = data.length;

        if (total === 0) {
            this.playerValue.string = `0${this.suffix}`;
            this.bankerValue.string = `0${this.suffix}`;
            this.tieValue.string = `0${this.suffix}`;

            return;
        }

        let playerCount = 0,
            tieCount = 0;
        data.forEach((item) => {
            switch (item) {
                case 0:
                    playerCount++;
                    break;
                case 2:
                    tieCount++;
                    break;
            }
        });

        const playerValue = Math.round((playerCount * 100) / total);
        const tieValue = Math.round((tieCount * 100) / total);
        const bankerValue = 100 - (playerValue + tieValue);

        this.playerValue.string = `${playerValue}${this.suffix}`;
        this.bankerValue.string = `${bankerValue}${this.suffix}`;
        this.tieValue.string = `${tieValue}${this.suffix}`;
    }

    updateTotalMode() {
        if (this.totalNode) {
            this.totalNode.active = true;
        }

        const data = this.data.map((d) => {
            const list = ["even", "odd"];
            const result = this.getValueValid(list, d);
            let redCount = 0;
            const listRed = ["red1", "red2", "red3", "red4"];
            listRed.forEach((i) => {
                if (d.result.player[i]) {
                    redCount++;
                }
                if (d.result.banker[i]) {
                    redCount++;
                }
            });
            return { result, redCount };
        });

        const historyData = data.map((d) => d.result);
        this.updateTotalModeStatistic(historyData);

        if (this.sedieRoundHistory) {
            this.sedieRoundHistory.logControl.items = this.sedieModeItems;
            this.sedieRoundHistory.logControl.setData(historyData.reverse());
            const redCountData = data.map((d) => d.redCount).reverse();
            const items = this.sedieRoundHistory.logControl.content.getComponentsInChildren(VipSedieWarRoundHistoryItem);
            items.forEach((item, i) => item.setValue(redCountData[i]));
        }
    }

    updateTotalModeStatistic(data: any) {
        const total = data.length;
        if (total === 0) {
            this.totalOddValue.string = `0${this.suffix}`;
            this.totalEvenValue.string = `0${this.suffix}`;

            return;
        }

        let eventCount = 0;
        data.forEach((item) => {
            if (item === 0) {
                eventCount++;
            }
        });

        const evenValue = Math.round((eventCount * 100) / total);
        const oddValue = 100 - evenValue;

        this.totalOddValue.string = `${oddValue}${this.suffix}`;
        this.totalEvenValue.string = `${evenValue}${this.suffix}`;
    }
}

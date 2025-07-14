import * as i18n from "i18n/runtime-scripts/LanguageData";

import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import CascadingSlotTicketDetailItem from "./CascadingSlotTicketDetailItem";
import CascadingSlotTotalMultiplier from "./CascadingSlotTotalMultiplier";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingSlotTicketDetail extends cc.Component {
    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    @property(cc.Label)
    roundId: cc.Label = null;

    @property(cc.Prefab)
    ticketDetailItemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    totalMultiplierPrefab: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    multiplierNode: cc.Node = null;

    @property(cc.Label)
    multiplierTotal: cc.Label = null;

    @property(cc.Label)
    textMultiplier: cc.Label = null;

    @property(cc.Label)
    winTotal: cc.Label = null;

    @property(cc.Label)
    reachMaxText: cc.Label = null;

    data: any = null;

    gameId: number;

    onLoad() {
        this.commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }
    setData(data: any) {
        this.data = data;
        const freeSpin = data.freeSpin;
        this.roundId.string = freeSpin ? `${data.id} (Free Spin)` : `${data.id}`;
        const tumbles = data.settlementResult.tumbles;
        const isReachMaxWin = data.reachMaxWin;

        let currWinTumble = 0;

        tumbles.forEach((tumble, index) => {
            const detailItem = this.loadDetailItem();
            const control = detailItem.getComponent(CascadingSlotTicketDetailItem);
            control.gameId = this.gameId;
            this.loadGameAtlas(control, this.gameId);
            if ((index === tumbles.length - 1 && !isReachMaxWin) || index < tumbles.length - 1) {
                currWinTumble += tumble.win;
                control.setData(tumble, index, data, currWinTumble);
                this.content.addChild(detailItem);
            }
            const newTumbleMultipliers = [...tumble.multipliers];
            control.setDataResultBoard(tumble.originalBoard, newTumbleMultipliers);
        });
        this.handleMultiplierData(data);
        this.winTotal.string = numberWithCommas(data.betwin, 2, false);
        this.reachMaxText.node.active = isReachMaxWin;
        const reachMaxLocalize = `cascadingSlot.reachMaxWin`;
        this.reachMaxText.string = `(${GameUtils.getText(reachMaxLocalize)}) `;
    }

    async loadGameAtlas(control: CascadingSlotTicketDetailItem, gameId: number) {}
    loadDetailItem() {
        return cc.instantiate(this.ticketDetailItemPrefab);
    }

    handleMultiplierData(data: any) {
        let lbMulti = "";
        const freeSpin = data.freeSpin;
        const tumbles = data.settlementResult.tumbles;
        if (freeSpin) {
            if (data.totalMultipliers) {
                lbMulti = `cascadingSlot.totalMultiplier`;
                this.multiplierTotal.string = data.totalMultiplier;
                this.multiplierTotal.node.color = this.textMultiplier.node.color = cc.color(66, 190, 254);
                this.multiplierNode.active = true;
            }
        } else {
            lbMulti = `cascadingSlot.multiplier`;
            this.multiplierTotal.string = data.multiplier;
            this.multiplierNode.active = tumbles.length > 1 && +data.multiplier > 0;
        }
        this.textMultiplier.string = `${i18n.t(lbMulti)}:`;
        const btnTextMulti = this.textMultiplier.getComponent(cc.Button);
        const btnValueMulti = this.multiplierTotal.getComponent(cc.Button);
        btnTextMulti.interactable = btnValueMulti.interactable = freeSpin;
    }

    onClickMultiplier() {
        const totalMultiplier = cc.instantiate(this.totalMultiplierPrefab);
        const totalControl = totalMultiplier.getComponent(CascadingSlotTotalMultiplier);
        totalControl.setData(this.data);
        this.node.addChild(totalMultiplier);
    }
}

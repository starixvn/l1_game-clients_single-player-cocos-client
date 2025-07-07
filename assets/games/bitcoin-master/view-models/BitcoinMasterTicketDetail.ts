import GameTicketDetailBase from "../../_base/view-models/GameTicketDetailBase";
import BitcoinMasterTicketDetailItem from "./BitcoinMasterTicketDetailItem";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterTicketDetail extends GameTicketDetailBase {
    @property(cc.Label)
    roundID: cc.Label = null;

    @property(cc.Label)
    openValue: cc.Label = null;

    @property(cc.Label)
    closeValue: cc.Label = null;

    @property(cc.Prefab)
    ticketItemPrefab: cc.Prefab = null;

    HEIGHT_BET_DETAIL_TABLE = 460;
    WIDTH_BET_DETAIL_TABLE = 948;

    setData(data: any) {
        const { betLogDetails, result } = data;
        this.setGeneralInfo(data);
        betLogDetails.forEach((detail, index) => {
            const node = cc.instantiate(this.ticketItemPrefab);
            this.content.addChild(node);
            node.active = true;
            const item = node.getComponent(BitcoinMasterTicketDetailItem);
            item.setData(detail, result, index);
        });
    }

    setGeneralInfo(data) {
        const { phien, result } = data;
        this.roundID.string = phien;
        this.openValue.string = BitcoinMasterUtils.formattingBitcoinValue(result.open);
        this.closeValue.string = BitcoinMasterUtils.formattingBitcoinValue(result.close);
    }
}

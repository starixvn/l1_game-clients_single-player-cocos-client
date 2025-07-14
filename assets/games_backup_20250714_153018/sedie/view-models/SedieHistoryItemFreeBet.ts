import SedieHistoryItem from "./SedieHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieHistoryItemFreeBet extends cc.Component {
    @property(cc.Button)
    linkContainerButton: cc.Button = null;

    @property(cc.Node)
    linkIcon: cc.Node = null;

    @property(cc.Node)
    scoinIcon: cc.Node = null;

    @property(SedieHistoryItem)
    sedieHistoryItem: SedieHistoryItem = null;

    betLog: any;

    onLoad() {
        this.sedieHistoryItem.itemCallback = () => {
            this.handleItems(this.sedieHistoryItem.betLog);
        };
    }

    handleItems(betLog: any) {
        this.betLog = betLog;
        this.linkContainerButton.interactable = false;
        if (betLog.freeBet) {
            this.scoinIcon.active = true;
            this.linkIcon.active = true;
            this.linkContainerButton.interactable = true;
        }
    }
}

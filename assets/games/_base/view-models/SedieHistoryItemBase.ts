import SocketIOHistoryItemBase from "./SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieHistoryItemBase extends SocketIOHistoryItemBase {
    @property(cc.Sprite)
    kqSprite: cc.Sprite = null;

    @property(cc.Label)
    kqLabel: cc.Label = null;

    @property(cc.Label)
    date: cc.Label = null;

    @property(cc.Label)
    hour: cc.Label = null;
}

import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import { JackpotEvents } from "../../../managers/JackpotEvents";
import { jackpotManager } from "../../../managers/JackpotManager";
import JackpotTopWinnersItem from "./JackpotTopWinnersItem";
import LobbyManager from "./LobbyManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotTopWinners extends cc.Component {
    @property(cc.Node)
    listUserNode: cc.Node = null;

    @property(cc.Node)
    noUserNode: cc.Node = null;

    @property(cc.Prefab)
    winnerItem: cc.Prefab = null;

    onLoad() {
        this.listUserNode.active = false;
        this.handleNoUser(!this.listUserNode.active);
        this.initEvents();
        this.requestData();
        this.schedule(this.requestData, 60);
    }

    onEnable() {
        // node is disabled, the schedule does not work
        this.requestData();
    }

    onDestroy() {
        this.unschedule(this.requestData);
        uiManager.removeListenersWithTarget(this);
    }

    requestData() {
        jackpotManager.emitEvent(JackpotEvents.GET_WINNERS, { limit: 10 });
    }

    initEvents() {
        uiManager.emitterListener(InternalEvents.RECEIVED_JACKPOT_WINNERS, (data) => this.onData(data), this);
    }

    onData(data: any) {
        try {
            this.handleNoUser(data.length === 0);
            this.setData(data);
        } catch (error) {
            cc.log("An error occurred during RECEIVED_JACKPOT_WINNERS:", error);
        }
    }

    handleNoUser(status = true) {
        if (!this.noUserNode || !this.listUserNode) {
            return;
        }
        this.noUserNode.active = status;
        this.listUserNode.destroyAllChildren();
        this.listUserNode.active = !status;
    }

    setData(data: any) {
        if (!this.listUserNode || data.length === 0) {
            return;
        }

        data.forEach((playerData) => {
            const winnerNode = cc.instantiate(this.winnerItem);
            this.listUserNode?.addChild(winnerNode);
            const player = winnerNode.getComponent(JackpotTopWinnersItem);
            player?.setData(playerData);
        });
    }

    onClickNoUsers(e) {
        uiManager.emitter.emit(InternalEvents.CHANGE_CATEGORY, LobbyManager.getInstance().getCategoryIndexByName("slots"));
    }
}

import NotificationService from "../../../common/auth/NotificationService";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GameNotification extends cc.Component {
    @property
    gameId = 0;

    @property
    key = "lobby";

    @property(cc.Node)
    noticeNode: cc.Node = null;

    private dataKey = "";
    private readonly dataType = "gameNotification";
    private isScheduling = false;

    onLoad() {
        this.gameId > 0 && this.initReceiveEvents();
    }

    initReceiveEvents() {
        this.dataKey = `${this.key}_${this.gameId}_${Date.now()}`;
        NotificationService.getInstance().addDataObserver(this.dataType, this.dataKey, this.receivedData.bind(this));
        this.getData();
        this.schedule(this.getData, 1, cc.macro.REPEAT_FOREVER, 0);
        this.isScheduling = true;
    }

    private getData() {
        NotificationService.getInstance().emitEvent("gameNotification", {
            gameId: this.gameId
        });
    }

    onDestroy() {
        NotificationService.getInstance().removeDataObserver(this.dataType, this.dataKey);
    }

    private receivedData(data) {
        this.removeSchedule();
        const notification = data.find((notification) => notification.gameId === this.gameId);
        if (notification) {
            this.noticeNode.active = true;
        }
    }

    private removeSchedule() {
        if (this.isScheduling) {
            this.getData();
            this.unschedule(this.getData);
            this.isScheduling = false;
        }
    }
}

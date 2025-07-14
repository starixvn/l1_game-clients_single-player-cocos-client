import SafeDraggableItem from "../../../common/draggable-layout/view-models/SafeDraggableItem";
import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import { LuckyWheelId } from "./LuckyWheel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LuckyWheelIcon extends SafeDraggableItem {
    @property(cc.Prefab)
    luckyWheelPrefab: cc.Prefab = null;

    private miniPanel: MiniPanel;
    private isOpen = false;

    init(main: MiniPanel) {
        this.miniPanel = main;
    }

    onLoad() {
        super.onLoad();
        if (!cc.sys.isMobile) {
            this.node.scale = 0.75;
        }

        this.touchCallback.end = (isClicked) => {
            if (isClicked) {
                this.openGame();
            }
        };
    }

    openGame() {
        if (this.isOpen) {
            return;
        }
        appManager.autoOpenLuckyWheel = false;
        this.isOpen = true;
        this.scheduleOnce(() => {
            this.isOpen = false;
        }, 1);

        uiManager.setCurrentGameId(LuckyWheelId);
        this.miniPanel.openNewSocketMiniGame(null, LuckyWheelId);
    }
}

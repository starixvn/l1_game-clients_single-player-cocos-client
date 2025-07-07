import GameUtils from "../../../common/GameUtils";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import { jackpotManager, JackpotPoolType } from "../../../managers/JackpotManager";
import BannerJackpotPoolItem from "./BannerJackpotPoolItem";
import JackpotPoolInfo from "./JackpotPoolInfo";
import JackpotPoolItem from "./JackpotPoolItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BannerJackpotPool extends JackpotPoolInfo {
    @property({ type: JackpotPoolItem, visible: false, override: true })
    items: JackpotPoolItem[] = [];

    @property({ visible: false, override: true })
    gameId = 0;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    gamePool: cc.Prefab = null;

    private poolData: any;
    private selectedTab: number;
    protected dragThreshold = 0.25;

    protected initEvents() {
        uiManager.emitterListener(InternalEvents.RECEIVED_JACKPOT_POOLS, (data) => this.onData(data), this);
    }

    onData(data: any) {
        this.poolData = data;
        this.loadData(this.selectedTab ?? JackpotPoolType.GRAND);
    }

    protected requestData() {
        jackpotManager.requestAllJackpotPools();
    }

    selectPool(event, type) {
        this.loadData(+type);
    }

    private loadData(type: number) {
        if (!this.poolData) {
            return;
        }

        this.selectedTab = type;
        this.content.destroyAllChildren();
        this.poolData[type].forEach((pool) => {
            const item = GameUtils.createNodeFromPrefab(this.gamePool);
            if (item) {
                this.content?.addChild(item);
                const poolItemComp = item.getComponent(BannerJackpotPoolItem);
                poolItemComp.setData(pool);
            }
        });
    }
}

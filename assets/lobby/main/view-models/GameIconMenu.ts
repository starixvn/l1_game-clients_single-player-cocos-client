import BaseComponent from "../../../common/BaseComponent";
import GameUtils from "../../../common/GameUtils";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import SkeletonIcon from "./SkeletonIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class GameIconMenu extends BaseComponent {
    @property(cc.Node)
    content: cc.Node = null;

    public miniPanel: MiniPanel;
    private initialized = false;
    private loadingGameIds: number[];
    protected listIconObscure: Array<SkeletonIcon> = [];
    protected readonly durationAutoHideSkeleton = 1;

    onLoad() {
        if (this.content) {
            this.content.destroyAllChildren();
            this.initItems();
        }
    }

    getList() {
        return null;
    }

    async initItems() {
        cc.log("Start loading icons---------");
        this.listIconObscure = [];
        const gameIds = this.getList();
        this.loadingGameIds = gameIds;

        for (const id of gameIds) {
            const prefab = await GameUtils.asyncExecute(this?.node, this.loadPrefab(id));
            if (this.loadingGameIds !== gameIds) {
                this.content && this.content.destroyAllChildren();
                return;
            }

            const node = this.addItem(id, prefab);
            if (node) {
                node.on("click", this.itemPressed.bind(this, id, node));
            }
        }

        this.onItemsChanged();

        if (!this.isAlive() || this.initialized) {
            return;
        }
        this.initialized = true;
        this.onInitialized();
    }

    abstract loadPrefab(gameId: number): Promise<cc.Prefab>;
    abstract addItem(id: number, prefab: cc.Prefab): cc.Node;
    abstract itemPressed(id: number, node);

    onInitialized() {
        // handle onInitialized
    }

    onItemsChanged() {
        // handle on Items changed
    }
}

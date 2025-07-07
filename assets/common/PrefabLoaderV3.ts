import { BundleManager } from "bundle-management";
import GameBase from "../games/_base/GameBase";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Common/PrefabLoaderV3")
export default class PrefabLoaderV3 extends cc.Component {
    public prefab: cc.Prefab = null;

    @property(cc.Node)
    nodeGameBase: cc.Node = null;

    @property
    prefabPath = "abc";

    @property
    prefabName = "abc";

    @property([cc.Component.EventHandler])
    private readonly initializationEventHandlers: cc.Component.EventHandler[] = [];

    public instance: cc.Node;

    protected async onLoad() {
        await this.createInstance();
        this.initialize();
    }

    private initialize() {
        if (this.instance) {
            this.node.addChild(this.instance);
            this.initializationEventHandlers.forEach((eventHandler) => eventHandler.emit([this.instance]));
        }
    }

    protected async createInstance() {
        await this.loadPrefab();
        if (!this.prefab) {
            return;
        }
        this.instance = cc.instantiate(this.prefab);
    }

    protected async loadPrefab() {
        const game = this.nodeGameBase.getComponent(GameBase);
        const gameId = game.gameId;

        const path = `${this.prefabPath}/${this.prefabName}`;
        try {
            const prefab = await BundleManager.getInstance().loadAsset<cc.Prefab>({
                bundleId: gameId.toString(),
                path: path,
                pathForDevMode: "",
                type: cc.Prefab
            });

            this.prefab = prefab;
        } catch (e) {
            console.warn(`Missing prefab for ${path} `, e);
        }
    }
}

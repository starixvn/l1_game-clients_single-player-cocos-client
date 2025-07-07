const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Common/PrefabLoaderV2")
export default class PrefabLoaderV2 extends cc.Component {
    @property(cc.Prefab)
    public prefab: cc.Prefab = null;

    @property([cc.Component.EventHandler])
    private readonly initializationEventHandlers: cc.Component.EventHandler[] = [];

    public instance: cc.Node;

    protected onLoad() {
        this.createInstance();
        this.initialize();
    }

    protected createInstance() {
        this.instance = cc.instantiate(this.prefab);
    }

    private initialize() {
        if (this.instance) {
            this.node.addChild(this.instance);
            this.initializationEventHandlers.forEach((eventHandler) => eventHandler.emit([this.instance]));
        }
    }
}

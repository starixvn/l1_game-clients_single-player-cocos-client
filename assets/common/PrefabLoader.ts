const { ccclass, property, menu } = cc._decorator;

enum PrefabLoaderType {
    Automatic = 0,
    Manual
}

function isManual(this: PrefabLoader) {
    return this.type === PrefabLoaderType.Manual;
}

@ccclass
@menu("Common/PrefabLoader")
export default class PrefabLoader extends cc.Component {
    @property(cc.Prefab)
    protected prefab: cc.Prefab = null;

    @property({ type: cc.Enum(PrefabLoaderType) })
    protected type: PrefabLoaderType = PrefabLoaderType.Manual;

    @property({ visible: isManual })
    key = "";

    private prefabInstance: cc.Node;
    private readonly initializeFunctions: Function[] = [];

    start() {
        if (this.type === PrefabLoaderType.Automatic) {
            this.initialize();
        }
    }

    initialize() {
        if (this.prefab) {
            try {
                this.prefabInstance = cc.instantiate(this.prefab);

                this.initializeFunctions.forEach((initialize) => {
                    initialize(this.prefabInstance);
                });
                this.node.addChild(this.prefabInstance);
            } catch (error) {
                // The error occurs only during the development
                cc.error(error);
            }
        }
    }

    setPrefab(prefab: cc.Prefab) {
        this.prefab = prefab;

        if (this.prefabInstance) {
            this.prefabInstance.removeFromParent();
            this.initialize();
        }
    }

    onInitialize(...method: ((node: cc.Node) => void)[]) {
        if (method) {
            this.initializeFunctions.push(...method);
        }
    }

    static registerIniEvents(loaders: PrefabLoader[], key: string, ...callbacks: ((node: cc.Node) => void)[]) {
        const loader = loaders.find((loader) => loader.key === key);

        if (loader) {
            loader.onInitialize(...callbacks);
        }
    }

    static initLoadersManually(loaders: PrefabLoader[]) {
        loaders?.forEach((loader) => loader.initialize());
    }
}

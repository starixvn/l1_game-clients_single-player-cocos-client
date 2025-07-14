const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotReelItem extends cc.Component {
    @property(cc.Prefab)
    itemPrefabs: cc.Prefab[] = [];

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    winningEffect: cc.Node = null;

    @property(sp.Skeleton)
    effectSpine: sp.Skeleton = null;

    @property(cc.Node)
    blurSymbol: cc.Node = null;

    public index = -1;
    public gameId: number;

    onLoad() {
        this.showWinningEffect(false);
        this.blurSymbol && (this.blurSymbol.opacity = 0);
    }

    setItem(index: number) {
        if (index === this.index) {
            return;
        }
        this.index = index;
        this.replaceItem(index);
    }

    protected getItemPrefab(index: number): cc.Prefab {
        return this.itemPrefabs[index];
    }

    public replaceItem(index: number) {
        this.content.removeAllChildren();
        const prefab = this.getItemPrefab(index);
        if (prefab) {
            const node = cc.instantiate(prefab);
            this.content.addChild(node);
        } else {
            console.warn("Slot item not loaded ", index);
        }
    }

    showWinningEffect(show: boolean) {
        this.winningEffect.active = show;
        if (show) {
            this.playEffectSpine();
        }
    }

    private playEffectSpine() {
        if (this.effectSpine) {
            this.effectSpine.setAnimation(0, this.effectSpine.animation, false);
        }
    }

    handleBlurAnim(isShowBlurSymbol: boolean) {
        if (!this.effectSpine || !this.blurSymbol) {
            return;
        }
        if (isShowBlurSymbol) {
            this.blurSymbol.opacity = 255;
            this.blurSymbol.scale = 1.5;
            this.effectSpine.node.opacity = 0;
        } else {
            this.blurSymbol.opacity = 0;
            this.effectSpine.node.opacity = 255;
        }
    }
}

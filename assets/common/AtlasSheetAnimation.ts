const { ccclass, property } = cc._decorator;

@ccclass
export default class AtlasSheetAnimation extends cc.Component {
    @property(cc.SpriteAtlas)
    spriteAtlas: cc.SpriteAtlas = null;

    @property
    frameNumber = 0;

    @property
    duration = 0;

    @property
    prefixNameAtlas = "";

    @property
    isLoop = true;

    onLoad() {
        const spriteNode = this.node.children[0];

        let index = 0;
        this.schedule(
            () => {
                index++;
                spriteNode.getComponent(cc.Sprite).spriteFrame = this.spriteAtlas.getSpriteFrame(
                    `${this.prefixNameAtlas}_${String(index).padStart(2, "0")}`
                );
                if (index === this.frameNumber) {
                    index = 0;
                    if (!this.isLoop) {
                        this.node.destroy();
                    }
                }
            },
            this.duration / this.frameNumber,
            cc.macro.REPEAT_FOREVER,
            0
        );
    }
}

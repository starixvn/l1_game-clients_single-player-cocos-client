const { ccclass, property } = cc._decorator;

@ccclass
export default class VipFishPrawnCrabStatsItem extends cc.Component {
    @property({ type: cc.Sprite })
    icons: cc.Sprite[] = [];

    setData(normalCharacter: cc.SpriteFrame, highlightCharacter: cc.SpriteFrame, roundIndex: number, index: number) {
        this.icons[index].node.stopAllActions();

        if (roundIndex === 0) {
            this.icons[index].spriteFrame = highlightCharacter;
            cc.tween(this.icons[index].node)
                .delay(index)
                .call(() => {
                    cc.tween(this.icons[index].node)
                        .repeatForever(
                            cc
                                .tween()
                                .to(0.2, { scale: 0.4, opacity: 200 }, { easing: "cubicIn" })
                                .delay(0.1)
                                .to(0.2, { scale: 0.45, opacity: 255 }, { easing: "cubicOut" })
                                .delay(0.1)
                                .to(0.2, { scale: 0.4, opacity: 200 }, { easing: "cubicIn" })
                                .delay(0.1)
                                .to(0.2, { scale: 0.45, opacity: 255 }, { easing: "cubicOut" })
                                .delay(3)
                        )
                        .start();
                })
                .start();
        } else {
            this.icons[index].spriteFrame = normalCharacter;
        }
    }
}

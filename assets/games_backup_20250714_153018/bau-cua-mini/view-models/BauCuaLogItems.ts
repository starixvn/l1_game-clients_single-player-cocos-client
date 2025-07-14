const { ccclass, property } = cc._decorator;

@ccclass
export default class BauCuaLogItems extends cc.Component {
    @property({ type: cc.Sprite })
    icon: cc.Sprite[] = [];

    setData(result: any, iconSpiteFrames: cc.SpriteFrame[]) {
        Object.values(result).forEach((character: number, index: number) => {
            this.icon[index].spriteFrame = iconSpiteFrames[character];
        });
    }
}

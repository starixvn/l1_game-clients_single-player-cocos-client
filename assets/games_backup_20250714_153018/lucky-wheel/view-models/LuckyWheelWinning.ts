const { ccclass, property } = cc._decorator;

@ccclass
export default class LuckyWheelWinning extends cc.Component {

    @property(cc.Label)
    scoin: cc.Label = null;

    updateScoin(scoin: number) {
        this.scoin.string = scoin.toString();
    }
}

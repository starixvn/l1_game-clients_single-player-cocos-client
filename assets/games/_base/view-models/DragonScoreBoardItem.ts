const { ccclass, property } = cc._decorator;

@ccclass
export default class DragonScoreBoardItem extends cc.Component {
    @property(cc.Node)
    tie: cc.Node = null;

    @property(cc.Label)
    tieCount: cc.Label = null;

    @property(cc.Node)
    main: cc.Node = null;
}

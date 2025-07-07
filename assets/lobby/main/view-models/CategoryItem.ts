const { ccclass, property } = cc._decorator;

@ccclass
export default class CategoryItem extends cc.Component {
    @property(cc.Node)
    newNode: cc.Node = null;
}

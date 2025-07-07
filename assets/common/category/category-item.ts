const { ccclass, property } = cc._decorator;

@ccclass
export default class CategoryItem extends cc.Component {
    @property
    category = "";
}

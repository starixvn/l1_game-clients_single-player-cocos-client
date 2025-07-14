import ItemContentMenu from "../../../common/helpers/Menu/ItemContentMenu";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterItemContentMenu extends ItemContentMenu {
    select() {
        super.select();
        this.text.color = cc.Color.WHITE;
    }
}

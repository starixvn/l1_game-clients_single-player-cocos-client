import HandleSwapAction from "./HandleSwapAction";
import InGameMenu, { InGameMenuEvents } from "./InGameMenu";

const { ccclass, property } = cc._decorator;
@ccclass
export default class InGameSwapMenu extends InGameMenu {
    @property(HandleSwapAction)
    swapComp: HandleSwapAction = null;

    onClickSwapCard() {
        this.node.emit(InGameMenuEvents.CHANGE_SWAP_CARD);
    }
}

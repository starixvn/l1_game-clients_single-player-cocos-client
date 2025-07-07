import InGameMenu from "../../../common/in-game-menu/InGameMenu";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LeftControls extends cc.Component {
    @property(InGameMenu)
    ingameMenu: InGameMenu = null;

    collapseMenu() {
        this.ingameMenu?.expandableMenu?.collapseMenu(false);
    }
}

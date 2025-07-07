import { MINI_GAMES_SCALE_ON_DESKTOP } from "./GameUtils";

const { ccclass } = cc._decorator;

@ccclass
export default class CustomScaleMiniGame extends cc.Component {
    onLoad() {
        if (!cc.sys.isMobile) {
            this.node.scale = MINI_GAMES_SCALE_ON_DESKTOP;
        }
    }
}

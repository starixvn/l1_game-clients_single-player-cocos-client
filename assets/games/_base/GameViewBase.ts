import BaseComponent from "../../common/BaseComponent";
import { getGameName } from "../../configs/GameConfigurations";
import MiniPanel from "../../mini-games-panel/view-models/MiniPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameViewBase extends BaseComponent {
    public currentMiniPanel: MiniPanel;
    public isGameHide = false;
    protected _gameId: number;
    public set gameId(value: number) {
        this._gameId = value;
    }

    public get gameId(): number {
        return this._gameId;
    }

    public get gameName() {
        return getGameName(this.gameId);
    }

    onLoad() {
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
    }

    onDestroy() {
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
    }

    initMiniPanel(miniPanel: MiniPanel) {
        this.currentMiniPanel = miniPanel;
    }

    openGame() {
        this.node.active = true;
    }

    onSignIn() {
        //empty
    }

    protected onGameHide() {
        //empty
        this.isGameHide = true;
    }

    protected onGameShow() {
        //empty
    }
}

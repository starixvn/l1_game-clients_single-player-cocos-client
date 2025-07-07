import { Socket } from "socket.io-client";

import { lazyInject } from "../../Application";
import { appManager } from "../../managers/AppManager";
import { StorageManager } from "../../managers/StorageManager";
import SocketIOController from "../../SocketIOController";
import MultiOrientationGame from "./MultiOrientationGame";
import { Orientation } from "./Orientation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiOrientationControl extends cc.Component {
    @property({ type: cc.Prefab })
    gamePrefabs: cc.Prefab[] = [];

    games: MultiOrientationGame[] = [];

    @lazyInject(SocketIOController)
    protected readonly socketIOController: SocketIOController;
    protected socket: Socket;
    protected _gameId: number;
    protected _orientation = Orientation.Landscape;

    public set gameId(value: number) {
        this._gameId = value;
    }

    public get gameId(): number {
        return this._gameId;
    }

    private currentBet: number;

    onLoad() {
        this.socket = this.socketIOController.getSocketGame(this.gameId);
        this.initGames();
        this.initChangeOrientationCallback();
        this.initShowHideEvent();
        this.loadOrientationData();
        this.updateGames();
    }

    initShowHideEvent() {
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
    }

    onGameHide() {
        this.saveOrientationData();
    }

    loadOrientationData() {
        const data = StorageManager.get(`orientation`) ?? {};
        if (!data.orientation || !data.orientation[this.gameId]) {
            return;
        }
        this._orientation = data.orientation[this.gameId];
        StorageManager.remove(`orientation`);
    }

    saveOrientationData() {
        const data = {
            orientation: {
                [this.gameId]: this._orientation
            }
        };

        StorageManager.set(`orientation`, data);
    }

    initGames() {
        this.gamePrefabs.forEach((prefab, index) => {
            const node = cc.instantiate(prefab);
            this.node.addChild(node);
            node.angle = index === Orientation.Portrait ? 90 : 0;
            const orientationGame = node.getComponent(MultiOrientationGame);
            orientationGame.onCurrentBetChange = (bet) => (this.currentBet = bet);
            orientationGame.getCurrentBet = () => {
                return this.currentBet;
            };
            this.currentBet = parseInt(orientationGame.betChips.getCurrentBet());
            this.games.push(orientationGame);
        });
    }

    initChangeOrientationCallback() {
        this.games.forEach((game) => (game.changeOrirentationCallback = this.changeOrientation.bind(this)));
    }

    onDestroy() {
        this.socketIOController.closeSocket(this.gameId);
    }

    changeOrientation() {
        if (this.games.length < 2) {
            return;
        }
        this._orientation = this._orientation === Orientation.Landscape ? Orientation.Portrait : Orientation.Landscape;
        this.updateGames();
    }

    updateGames() {
        this.games.forEach((child, index) => {
            const show = index === this._orientation;
            if (!show && child.node.active) {
                child.stopGame();
            }
            child.node.active = show;

            if (show) {
                appManager.currentScene = child;
                child.betChips.setCurrentBet(this.currentBet.toString());
            }
        });
    }
}

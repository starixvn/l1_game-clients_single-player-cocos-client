import { Socket } from "socket.io-client";

import GameUtils from "../../common/GameUtils";
import { isMultiplayGame } from "../../common/mutliplay-utils";
import { getGameConfiguration } from "../../configs/GameConfigurations";
import GameViewBase from "../../games/_base/GameViewBase";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import MiniPanelSocketIOInitializers from "./MiniPanelSocketIOInitializers";

export default class MiniPanelMiniGameInitializers extends MiniPanelSocketIOInitializers {
    showGame(node: cc.Node) {
        if (node) {
            node.active = true;
            this.main.miniGames && this.main.miniGames.insertChild(node, this.main.miniGames.children.length - 1);
            this.main.setLoadingVisibility(false);
        }
    }

    getGameName(id: number): string {
        const gameConfiguration = getGameConfiguration(id);

        return gameConfiguration?.key;
    }

    async openMiniGame(gameId) {
        if (uiManager.getCurrentGameId() !== gameId) {
            return;
        }

        if (this.main.popupMiniGame && this.main.popupMiniGame.list.active) {
            this.main.popupMiniGame?.hideListGame();
        }

        const gameBase = this.main.getGameMini(gameId);
        const isAlreadyOpened = gameBase !== undefined;
        const gameLoading = this.main.getGameLoadingComp(+gameId);

        if (!isAlreadyOpened) {
            try {
                const gameName = GameUtils.getGameNameString(gameId);
                console.time("LoadScene " + gameName);
                const prefab = await GameUtils.loadMiniGamePrefab(gameId, (completedCount, total, item) => {
                    if (uiManager.getCurrentGameId() !== gameId) {
                        this.main.unCacheAndHideGameLoading(gameLoading, gameId);
                        return;
                    }

                    gameLoading?.onProgress(completedCount, total);
                });

                console.timeEnd("LoadScene " + gameName);

                if (!this.main.isAlive()) {
                    return;
                }

                this.main.unCacheAndHideGameLoading(gameLoading, gameId);

                if (uiManager.getCurrentGameId() !== gameId || this.main.getGameMini(gameId) !== undefined) {
                    return;
                }

                const node = cc.instantiate(prefab);
                const gameComponent = node.getComponent(GameViewBase);
                gameComponent.initMiniPanel(this.main);
                this.main.addMiniGame(gameComponent, gameId);
                gameComponent.openGame();
                uiManager.emitter.emit(InternalEvents.OPEN_GAME_MINI);
            } catch (error) {
                console.error(error);
                this.main.loading.node.active = false;
                this.main.onForceReload();
            }
        } else {
            this.showGame(gameBase.node);
            this.main.unCacheAndHideGameLoading(gameLoading, gameId);
        }
    }

    openGame(id) {
        this.openMiniGame(parseInt(id));
    }

    openMiniContainerGame(id: string) {
        this.openMiniGame(parseInt(id));
    }

    async openNewSocket(gameId) {
        let socket: Socket = this.socketIOController.getSocketGame(gameId);

        if (socket && socket.connected) {
            this.openMiniGame(gameId);
        } else {
            const multiplay = isMultiplayGame(gameId);
            if (socket && multiplay) {
                socket.removeAllListeners();
                socket.connect();
            } else {
                socket = this.createMiniGameSocket(gameId, true);
            }
            const gameName = await GameUtils.getDisplayGameName(gameId);
            this.initMiniGameSocketListeners(socket, gameId, gameName, null);
            socket.on("signedIn", () => {
                if (!this.main.isAlive()) {
                    return;
                }
                this.openMiniGame(gameId);
            });
        }
    }

    createMiniGameSocket(gameId: number, forceNew: boolean): Socket {
        return this.socketIOController.openMiniGameSocket(gameId, forceNew);
    }

    initMiniGameSocketListeners(socket, gameId: number, gameName: string, gameContainer: any) {
        const listenerOptions = {
            gameId,
            gameName,
            onConnectFailed: (name, gameId, isGameRoom) => {
                this.main.onConnectSocketFailed(name, gameId, isGameRoom);

                if (gameContainer && gameContainer.hideContainer) {
                    gameContainer.hideContainer();
                }
            },
            isGameRoom: false,
            gameContainer
        };
        this.socketIOController.initBaseListeners(socket, listenerOptions);

        this.handleSocket(socket, gameId);
    }
}

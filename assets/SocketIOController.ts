import { BundleManager } from "bundle-management";
import { injectable } from "inversify";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import * as MsgpackParser from "socket.io-msgpack-parser";

import { i18n } from "./ClientModules";
import { getSession } from "./common/auth/SessionManager";
import GameUtils from "./common/GameUtils";
import { buildGatewayUrl, buildServerUrl, getProxyRoute } from "./common/helpers/UrlHelper";
import { sentryLogger } from "./common/logger.js";
import { isMultiplayGame } from "./common/mutliplay-utils";
import { userManager } from "./common/user/UserManager";
import { enableMsgpackParserAllGames } from "./configs/Configs.js";
import { getGameConfiguration, isUsingRemoteBundle } from "./configs/GameConfigurations";
import { appManager } from "./managers/AppManager";
import { uiManager } from "./managers/GameUIManager";
import { InternalEvents } from "./managers/InternalEvents";
import SocketIOControllerInterface from "./SocketIOControllerInterface";



enum SocketState {
    NOT_CONNECT = 0,
    CONNECTED,
    CONNECT_ERROR,
    SIGNED_IN,
    DISABLED_GAME
}

@injectable()
export default class SocketIOController implements SocketIOControllerInterface {
    private gameSockets = {};
    private socketsState = {};

    public gameScene = {};

    protected readonly multiplayGames = [
        50,
        51,
        54,
        55, // UnbalancedBigSmall
        9,
        56,
        57,
        58, // MiniSedie
        52,
        53,
        14,
        15,
        16,
        17,
        18,
        19, //mega keno
        60
    ];

    constructor() {


    }

    public openMiniGameSocket(gameId, forceNew) {

        const proxyRoute = getProxyRoute(gameId);
        const gameServerUrl = buildServerUrl("http", "", gameId);


        const option = {
            gameId,
            socketUri: gameServerUrl,
            proxyRoute,
            forceNew,
            enableMsgpackParser: enableMsgpackParserAllGames
        };

        const socket = this.createGameSocket(option);
        this.assignSocket(gameId, socket);

        return socket;
    }

    public openNewGameRoomSocket(gameId: number) {

        this.closeSocket(gameId);
        let socket: Socket = this.getSocketGame(gameId);
        const multiplay = isMultiplayGame(gameId);


        if (socket && !socket.connected && multiplay) {

            socket.removeAllListeners();
            socket.connect();
        }

        if (!socket) {

            const gameServerUrl = buildServerUrl("http", "", gameId);
            socket = this.createSocketByUrl(gameId, gameServerUrl);
        }
        this.assignSocket(gameId, socket);

        return socket;
    }

    getSocketGame(gameId: number) {

        const socket = this.gameSockets[gameId.toString()];

        return socket;
    }

    private assignSocket(gameId: number, socket: Socket) {

        this.gameSockets[gameId.toString()] = socket;
    }

    createSocketByUrl(gameId, socketUri) {

        const proxyRoute = getProxyRoute(gameId);

        const option = {
            socketUri,
            proxyRoute,
            forceNew: true,
            enableMsgpackParser: enableMsgpackParserAllGames,
            gameId
        };

        return this.createGameSocket(option);
    }

    initBaseListenersForSocketUrl(socket, gameId, onConnectFailed, onConnectCallback?) {

        const gameName = GameUtils.getGameNameString(gameId);

        const listenerOptions = {
            gameName,
            onConnectCallback,
            onConnectFailed,
            isGameRoom: true,
            gameContainer: null,
            gameId
        };

        this.initBaseListeners(socket, listenerOptions);
    }

    public async openGameSocket(gameId: number) {

        return new Promise<void>(async (resolve, reject) => {
            try {
                if (isUsingRemoteBundle(gameId)) {

                    await BundleManager.getInstance().loadBundle(`${gameId}`);

                }

                const isMiniGame = GameUtils.isMiniGame(gameId.toString());


                this.closeSocket(gameId);
                let socket: Socket = this.getSocketGame(gameId);
                const multiplay = isMultiplayGame(gameId);

                if (socket && !socket.connected && multiplay) {

                    socket.removeAllListeners();
                    socket.connect();
                }

                if (!socket) {

                    const gameServerUrl = buildServerUrl("http", "", gameId);
                    socket = this.createSocketByUrl(gameId, gameServerUrl);
                }

                this.newInitListeners(socket, gameId, isMiniGame);

                this.assignSocket(gameId, socket);
                this.socketsState[gameId] = SocketState.NOT_CONNECT;


                const onGameConnectionError = () => {
                    console.error("[SocketIOController] Game connection error for gameId:", gameId);
                    const data = {
                        text: i18n.t("messages.lostGameConnection", { gameName: GameUtils.getGameNameString(gameId) }),
                        isInfo: false
                    };
                    uiManager.emitter.emit(InternalEvents.NOTICE, {
                        data,
                        onConfirm: null,
                        onClose: () => {
                            this.onCloseNoticeConnectionError();
                        }
                    });
                };


                await this.waitSocketConnected(gameId);

                if (this.socketsState[gameId] === SocketState.CONNECT_ERROR) {
                    throw new Error("Socket connect error game id " + gameId);
                }


                const session = getSession();
                if (session.ss) {

                    socket.emit("signin", session);
                } else {
                    console.warn("[SocketIOController] No session available for signin");
                }


                await this.waitGameSignedIn(gameId);

                resolve();
            } catch (err) {
                console.error("[SocketIOController] Error opening game socket for gameId:", gameId, "Error:", err);
                uiManager.isPauseLoadingIcons = false;
                uiManager.emitter.emit(InternalEvents.LOAD_OTHER_ICONS_AND_BANNERS);
                if (this.socketsState[gameId] !== SocketState.DISABLED_GAME) {
                    const onGameConnectionError = () => {
                        console.error("[SocketIOController] Game connection error for gameId:", gameId);
                        const data = {
                            text: i18n.t("messages.lostGameConnection", { gameName: GameUtils.getGameNameString(gameId) }),
                            isInfo: false
                        };
                        uiManager.emitter.emit(InternalEvents.NOTICE, {
                            data,
                            onConfirm: null,
                            onClose: () => {
                                this.onCloseNoticeConnectionError();
                            }
                        });
                    };
                    onGameConnectionError();
                }
                reject(err);
            }
        });
    }

    private onCloseNoticeConnectionError() {

        appManager.backToOperatorLobby();
    }

    private newInitListeners(socket, gameId: number, isMiniGame: boolean) {


        socket.on("connect", () => {

            this.socketsState[gameId] = SocketState.CONNECTED;
        });

        socket.on("connect_error", (error) => {
            console.error("[SocketIOController] Socket connect error for gameId:", gameId, "Error:", error);
            this.socketsState[gameId] = SocketState.CONNECT_ERROR;

            sentryLogger.logError(error);
            socket.disconnect();
            uiManager.isPauseLoadingIcons = false;
        });

        socket.on("disconnect", (reason, detail: any) => {

            if (reason === "ping timeout" || reason === "transport error") {
                const message = detail?.message || detail?.description || "";
                const gameName = GameUtils.getGameNameString(gameId);
                console.warn("[SocketIOController] Socket disconnect -", gameName, "-", reason, ":", message);
                sentryLogger.log(`socket disconnect - ${gameName} - ${reason}:   ${message}`);
            }
        });

        socket.on("signedIn", () => {

            if (isMiniGame) {
                this.socketsState[gameId] = SocketState.SIGNED_IN;

            }
        });

        socket.on("message", (data) => {


            if (data.um) {
                if (data.um_message) {
                    console.warn("[SocketIOController] UM message received for gameId:", gameId, "Message:", data.um_message);
                    this.socketsState[gameId] = SocketState.DISABLED_GAME;
                    uiManager.isPauseLoadingIcons = false;
                    uiManager.emitter.emit(InternalEvents.GAME_IS_UM, { umMessage: data.um_message, gameId });
                }
            }

            if (data.toGame) {

                this.socketsState[gameId] = SocketState.SIGNED_IN;
                this.gameScene[gameId] = data.toGame;
            }

            if (data.userStakeLevel) {

                userManager.updateUserStakeLevel(data.userStakeLevel);
            }

            if (data.unauthorized) {
                console.error("[SocketIOController] Unauthorized message received");
                appManager.forceKickedOut();
            }

            if (data.notPermittedToPlay) {
                console.warn("[SocketIOController] Not permitted to play message received for gameId:", gameId);
                uiManager.emitter.emit(InternalEvents.NOT_PERMITTED_TO_PLAY, { gameId });
                uiManager.isPauseLoadingIcons = false;
            }
        });
    }

    private async waitGameSignedIn(gameId) {

        await GameUtils.waitUntil(() => this.socketsState[gameId] === SocketState.SIGNED_IN, 200);

    }

    private async waitSocketConnected(gameId) {

        await GameUtils.waitUntil(() => this.socketsState[gameId] !== SocketState.NOT_CONNECT, 200);

    }

    createGatewayGameSocket(gameId: number) {

        const socketUri = buildGatewayUrl();


        const socketOptions: Partial<ManagerOptions & SocketOptions> = {
            forceNew: true,
            transports: ["websocket"],
            upgrade: false
        };

        if (enableMsgpackParserAllGames) {

            socketOptions.parser = MsgpackParser;
        }


        const socket = io(socketUri, socketOptions);
        this.assignSocket(gameId, socket);

        return socket;
    }

    createGameSocket = (option: {
        socketUri: string;
        proxyRoute: string;
        forceNew: boolean;
        enableMsgpackParser: boolean;
        gameId: any;
    }): Socket => {

        const { socketUri, proxyRoute, forceNew, enableMsgpackParser, gameId } = option;
        const multiplay = isMultiplayGame(gameId);


        const socketOptions: Partial<ManagerOptions & SocketOptions> = {
            forceNew: !multiplay && forceNew,
            transports: ["websocket"],
            upgrade: false,
            path: proxyRoute
        };

        if (enableMsgpackParser) {

            socketOptions.parser = MsgpackParser;
        }


        const socket = io(socketUri, socketOptions);

        return socket;
    };

    initBaseListeners(
        socket,
        option: {
            gameName: string;
            onConnectCallback?: (socket: Socket) => void;
            onConnectFailed: (gameName, gameId, isGameRoom) => void;
            isGameRoom: boolean;
            gameContainer: any;
            gameId: any;
        }
    ) {

        const { gameName, onConnectFailed, isGameRoom, gameContainer, gameId, onConnectCallback } = option;

        const needCallCallback = !gameContainer || gameContainer.isMain;
        let name = gameName;
        if (gameContainer && gameContainer.alternativeName) {
            name = gameContainer.alternativeName;
        }

        socket.on("connect", () => {

            if (onConnectCallback) {

                onConnectCallback(socket);
            } else {

                const session = getSession();
                session.ss && socket.emit("signin", session);
            }
        });

        socket.on("connect_error", (error) => {
            console.error("[SocketIOController] Base socket connect error for game:", name, "Error:", error);

            sentryLogger.logError(error);
            socket.disconnect();
            if (needCallCallback) {

                onConnectFailed(name, gameId, isGameRoom);
            }
            uiManager.isPauseLoadingIcons = false;
        });

        socket.on("disconnect", (reason, detail: any) => {

            if (reason === "ping timeout" || reason === "transport error") {
                const message = detail?.message || detail?.description || "";
                console.warn("[SocketIOController] Base socket disconnect -", gameName, "-", reason, ":", message);
                sentryLogger.log(`socket disconnect - ${gameName} - ${reason}:   ${message}`);
            }
        });
    }

    closeSocket(gameId) {

        const socket: Socket = this.gameSockets[gameId];
        if (socket) {

            socket.disconnect();
        } else {

        }

        const multiplay = isMultiplayGame(gameId);
        if (!multiplay) {

            this.deleteCachedSocket(gameId);
        }
    }

    deleteCachedSocket(gameId: number) {

        delete this.gameSockets[gameId];
    }

    closeAllSocket() {

        const keys = Object.keys(this.gameSockets);


        if (keys && keys.length) {
            keys.forEach(this.closeSocket.bind(this));
        }

    }

    closeMiniGameSockets() {

        const keys = Object.keys(this.gameSockets);
        keys.forEach((gameId) => {
            const gameConfiguration = getGameConfiguration(gameId);


            if (gameConfiguration?.mini) {

                this.closeSocket(gameId);
            }
        });

    }
}



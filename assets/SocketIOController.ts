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

console.log("[SocketIOController] Loading SocketIOController module...");

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
        console.log("[SocketIOController] SocketIOController instance created");
        console.log("[SocketIOController] Multiplay games configured:", this.multiplayGames);
    }

    public openMiniGameSocket(gameId, forceNew) {
        console.log("[SocketIOController] Opening mini game socket for gameId:", gameId, "forceNew:", forceNew);
        const proxyRoute = getProxyRoute(gameId);
        const gameServerUrl = buildServerUrl("http", "", gameId);
        console.log("[SocketIOController] Mini game server URL:", gameServerUrl, "proxy route:", proxyRoute);

        const option = {
            gameId,
            socketUri: gameServerUrl,
            proxyRoute,
            forceNew,
            enableMsgpackParser: enableMsgpackParserAllGames
        };
        console.log("[SocketIOController] Mini game socket options:", option);
        const socket = this.createGameSocket(option);
        this.assignSocket(gameId, socket);
        console.log("[SocketIOController] Mini game socket created and assigned for gameId:", gameId);
        return socket;
    }

    public openNewGameRoomSocket(gameId: number) {
        console.log("[SocketIOController] Opening new game room socket for gameId:", gameId);
        this.closeSocket(gameId);
        let socket: Socket = this.getSocketGame(gameId);
        const multiplay = isMultiplayGame(gameId);
        console.log("[SocketIOController] Is multiplay game:", multiplay);

        if (socket && !socket.connected && multiplay) {
            console.log("[SocketIOController] Reconnecting existing socket for multiplay game");
            socket.removeAllListeners();
            socket.connect();
        }

        if (!socket) {
            console.log("[SocketIOController] Creating new socket for game room");
            const gameServerUrl = buildServerUrl("http", "", gameId);
            socket = this.createSocketByUrl(gameId, gameServerUrl);
        }
        this.assignSocket(gameId, socket);
        console.log("[SocketIOController] Game room socket ready for gameId:", gameId);
        return socket;
    }

    getSocketGame(gameId: number) {
        console.log("[SocketIOController] Getting socket for gameId:", gameId);
        const socket = this.gameSockets[gameId.toString()];
        console.log("[SocketIOController] Socket found:", !!socket);
        return socket;
    }

    private assignSocket(gameId: number, socket: Socket) {
        console.log("[SocketIOController] Assigning socket for gameId:", gameId);
        this.gameSockets[gameId.toString()] = socket;
        console.log("[SocketIOController] Total active sockets:", Object.keys(this.gameSockets).length);
    }

    createSocketByUrl(gameId, socketUri) {
        console.log("[SocketIOController] Creating socket by URL for gameId:", gameId, "URI:", socketUri);
        const proxyRoute = getProxyRoute(gameId);

        const option = {
            socketUri,
            proxyRoute,
            forceNew: true,
            enableMsgpackParser: enableMsgpackParserAllGames,
            gameId
        };
        console.log("[SocketIOController] Socket creation options:", option);
        return this.createGameSocket(option);
    }

    initBaseListenersForSocketUrl(socket, gameId, onConnectFailed, onConnectCallback?) {
        console.log("[SocketIOController] Initializing base listeners for socket URL, gameId:", gameId);
        const gameName = GameUtils.getGameNameString(gameId);

        const listenerOptions = {
            gameName,
            onConnectCallback,
            onConnectFailed,
            isGameRoom: true,
            gameContainer: null,
            gameId
        };
        console.log("[SocketIOController] Listener options:", listenerOptions);
        this.initBaseListeners(socket, listenerOptions);
    }

    public async openGameSocket(gameId: number) {
        console.log("[SocketIOController] Opening game socket for gameId:", gameId);
        return new Promise<void>(async (resolve, reject) => {
            try {
                if (isUsingRemoteBundle(gameId)) {
                    console.log("[SocketIOController] Loading remote bundle for gameId:", gameId);
                    await BundleManager.getInstance().loadBundle(`${gameId}`);
                    console.log("[SocketIOController] Remote bundle loaded successfully");
                }

                const isMiniGame = GameUtils.isMiniGame(gameId.toString());
                console.log("[SocketIOController] Is mini game:", isMiniGame);

                this.closeSocket(gameId);
                let socket: Socket = this.getSocketGame(gameId);
                const multiplay = isMultiplayGame(gameId);

                if (socket && !socket.connected && multiplay) {
                    console.log("[SocketIOController] Reconnecting existing socket for multiplay game");
                    socket.removeAllListeners();
                    socket.connect();
                }

                if (!socket) {
                    console.log("[SocketIOController] Creating new socket for game");
                    const gameServerUrl = buildServerUrl("http", "", gameId);
                    socket = this.createSocketByUrl(gameId, gameServerUrl);
                }

                this.newInitListeners(socket, gameId, isMiniGame);

                this.assignSocket(gameId, socket);
                this.socketsState[gameId] = SocketState.NOT_CONNECT;
                console.log("[SocketIOController] Socket state set to NOT_CONNECT for gameId:", gameId);

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

                console.log("[SocketIOController] Waiting for socket connection...");
                await this.waitSocketConnected(gameId);

                if (this.socketsState[gameId] === SocketState.CONNECT_ERROR) {
                    throw new Error("Socket connect error game id " + gameId);
                }

                console.log("[SocketIOController] Socket connected, attempting signin...");
                const session = getSession();
                if (session.ss) {
                    console.log("[SocketIOController] Sending signin with session");
                    socket.emit("signin", session);
                } else {
                    console.warn("[SocketIOController] No session available for signin");
                }

                console.log("[SocketIOController] Waiting for game signin...");
                await this.waitGameSignedIn(gameId);
                console.log("[SocketIOController] Game socket opened successfully for gameId:", gameId);
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
        console.log("[SocketIOController] Handling connection error notice close");
        if (appManager.isDirectMode) {
            console.log("[SocketIOController] Direct mode - backing to operator lobby");
            appManager.backToOperatorLobby();
        } else {
            const currentSceneName = cc.director.getScene().name;
            console.log("[SocketIOController] Current scene:", currentSceneName);
            if (currentSceneName === "Splash") {
                console.log("[SocketIOController] Emitting CAN_NOT_OPEN_GAME_AT_SPLASH event");
                uiManager.emitter.emit(InternalEvents.CAN_NOT_OPEN_GAME_AT_SPLASH);
            }
        }
    }

    private newInitListeners(socket, gameId: number, isMiniGame: boolean) {
        console.log("[SocketIOController] Initializing new listeners for gameId:", gameId, "isMiniGame:", isMiniGame);

        socket.on("connect", () => {
            console.log("[SocketIOController] Socket connected for gameId:", gameId);
            this.socketsState[gameId] = SocketState.CONNECTED;
        });

        socket.on("connect_error", (error) => {
            console.error("[SocketIOController] Socket connect error for gameId:", gameId, "Error:", error);
            this.socketsState[gameId] = SocketState.CONNECT_ERROR;
            console.log(error);
            sentryLogger.logError(error);
            socket.disconnect();
            uiManager.isPauseLoadingIcons = false;
        });

        socket.on("disconnect", (reason, detail: any) => {
            console.log("[SocketIOController] Socket disconnected for gameId:", gameId, "Reason:", reason);
            if (reason === "ping timeout" || reason === "transport error") {
                const message = detail?.message || detail?.description || "";
                const gameName = GameUtils.getGameNameString(gameId);
                console.warn("[SocketIOController] Socket disconnect -", gameName, "-", reason, ":", message);
                sentryLogger.log(`socket disconnect - ${gameName} - ${reason}:   ${message}`);
            }
        });

        socket.on("signedIn", () => {
            console.log("[SocketIOController] Socket signed in for gameId:", gameId);
            if (isMiniGame) {
                this.socketsState[gameId] = SocketState.SIGNED_IN;
                console.log("[SocketIOController] Mini game signed in, state updated");
            }
        });

        socket.on("message", (data) => {
            console.log("[SocketIOController] Received message for gameId:", gameId, "Data:", data);

            if (data.um) {
                if (data.um_message) {
                    console.warn("[SocketIOController] UM message received for gameId:", gameId, "Message:", data.um_message);
                    this.socketsState[gameId] = SocketState.DISABLED_GAME;
                    uiManager.isPauseLoadingIcons = false;
                    uiManager.emitter.emit(InternalEvents.GAME_IS_UM, { umMessage: data.um_message, gameId });
                }
            }

            if (data.toGame) {
                console.log("[SocketIOController] Game scene data received for gameId:", gameId);
                this.socketsState[gameId] = SocketState.SIGNED_IN;
                this.gameScene[gameId] = data.toGame;
            }

            if (data.userStakeLevel) {
                console.log("[SocketIOController] User stake level update received:", data.userStakeLevel);
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
        console.log("[SocketIOController] Waiting for game signin for gameId:", gameId);
        await GameUtils.waitUntil(() => this.socketsState[gameId] === SocketState.SIGNED_IN, 200);
        console.log("[SocketIOController] Game signin completed for gameId:", gameId);
    }

    private async waitSocketConnected(gameId) {
        console.log("[SocketIOController] Waiting for socket connection for gameId:", gameId);
        await GameUtils.waitUntil(() => this.socketsState[gameId] !== SocketState.NOT_CONNECT, 200);
        console.log("[SocketIOController] Socket connection completed for gameId:", gameId);
    }

    createGatewayGameSocket(gameId: number) {
        console.log("[SocketIOController] Creating gateway game socket for gameId:", gameId);
        const socketUri = buildGatewayUrl();
        console.log("[SocketIOController] Gateway URL:", socketUri);

        const socketOptions: Partial<ManagerOptions & SocketOptions> = {
            forceNew: true,
            transports: ["websocket"],
            upgrade: false
        };

        if (enableMsgpackParserAllGames) {
            console.log("[SocketIOController] Enabling msgpack parser for gateway socket");
            socketOptions.parser = MsgpackParser;
        }

        console.log("[SocketIOController] Gateway socket options:", socketOptions);
        const socket = io(socketUri, socketOptions);
        this.assignSocket(gameId, socket);
        console.log("[SocketIOController] Gateway game socket created for gameId:", gameId);
        return socket;
    }

    createGameSocket = (option: {
        socketUri: string;
        proxyRoute: string;
        forceNew: boolean;
        enableMsgpackParser: boolean;
        gameId: any;
    }): Socket => {
        console.log("[SocketIOController] Creating game socket with options:", option);
        const { socketUri, proxyRoute, forceNew, enableMsgpackParser, gameId } = option;
        const multiplay = isMultiplayGame(gameId);
        console.log("[SocketIOController] Is multiplay game:", multiplay);

        const socketOptions: Partial<ManagerOptions & SocketOptions> = {
            forceNew: !multiplay && forceNew,
            transports: ["websocket"],
            upgrade: false,
            path: proxyRoute
        };

        if (enableMsgpackParser) {
            console.log("[SocketIOController] Enabling msgpack parser for game socket");
            socketOptions.parser = MsgpackParser;
        }

        console.log("[SocketIOController] Final socket options:", socketOptions);
        const socket = io(socketUri, socketOptions);
        console.log("[SocketIOController] Game socket created successfully");
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
        console.log("[SocketIOController] Initializing base listeners with options:", option);
        const { gameName, onConnectFailed, isGameRoom, gameContainer, gameId, onConnectCallback } = option;

        const needCallCallback = !gameContainer || gameContainer.isMain;
        let name = gameName;
        if (gameContainer && gameContainer.alternativeName) {
            name = gameContainer.alternativeName;
        }

        socket.on("connect", () => {
            console.log("[SocketIOController] Base socket connected for game:", name);
            if (onConnectCallback) {
                console.log("[SocketIOController] Calling onConnectCallback");
                onConnectCallback(socket);
            } else {
                console.log("[SocketIOController] Sending signin with session");
                const session = getSession();
                session.ss && socket.emit("signin", session);
            }
        });

        socket.on("connect_error", (error) => {
            console.error("[SocketIOController] Base socket connect error for game:", name, "Error:", error);
            console.log(error);
            sentryLogger.logError(error);
            socket.disconnect();
            if (needCallCallback) {
                console.log("[SocketIOController] Calling onConnectFailed callback");
                onConnectFailed(name, gameId, isGameRoom);
            }
            uiManager.isPauseLoadingIcons = false;
        });

        socket.on("disconnect", (reason, detail: any) => {
            console.log("[SocketIOController] Base socket disconnected for game:", name, "Reason:", reason);
            if (reason === "ping timeout" || reason === "transport error") {
                const message = detail?.message || detail?.description || "";
                console.warn("[SocketIOController] Base socket disconnect -", gameName, "-", reason, ":", message);
                sentryLogger.log(`socket disconnect - ${gameName} - ${reason}:   ${message}`);
            }
        });
    }

    closeSocket(gameId) {
        console.log("[SocketIOController] Closing socket for gameId:", gameId);
        const socket: Socket = this.gameSockets[gameId];
        if (socket) {
            console.log("[SocketIOController] Disconnecting socket");
            socket.disconnect();
        } else {
            console.log("[SocketIOController] No socket found to close");
        }

        const multiplay = isMultiplayGame(gameId);
        if (!multiplay) {
            console.log("[SocketIOController] Deleting cached socket for non-multiplay game");
            this.deleteCachedSocket(gameId);
        }
    }

    deleteCachedSocket(gameId: number) {
        console.log("[SocketIOController] Deleting cached socket for gameId:", gameId);
        delete this.gameSockets[gameId];
        console.log("[SocketIOController] Remaining active sockets:", Object.keys(this.gameSockets).length);
    }

    closeAllSocket() {
        console.log("[SocketIOController] Closing all sockets");
        const keys = Object.keys(this.gameSockets);
        console.log("[SocketIOController] Active sockets to close:", keys);

        if (keys && keys.length) {
            keys.forEach(this.closeSocket.bind(this));
        }
        console.log("[SocketIOController] All sockets closed");
    }

    closeMiniGameSockets() {
        console.log("[SocketIOController] Closing mini game sockets");
        const keys = Object.keys(this.gameSockets);
        keys.forEach((gameId) => {
            const gameConfiguration = getGameConfiguration(gameId);
            console.log("[SocketIOController] Checking game configuration for gameId:", gameId, "isMini:", gameConfiguration?.mini);

            if (gameConfiguration?.mini) {
                console.log("[SocketIOController] Closing mini game socket for gameId:", gameId);
                this.closeSocket(gameId);
            }
        });
        console.log("[SocketIOController] Mini game sockets closed");
    }
}

console.log("[SocketIOController] SocketIOController module loaded successfully");

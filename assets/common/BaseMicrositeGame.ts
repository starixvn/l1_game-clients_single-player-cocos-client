import * as i18n from "i18n/runtime-scripts/LanguageData";

import { lazyInject } from "../Application";
import { getGameConfiguration, initialize as initGameConfiguration, isGatewayGame, isMicroSite } from "../configs/GameConfigurations";
import { appManager } from "../managers/AppManager";
import { StorageManager } from "../managers/StorageManager";
import SocketIOController from "../SocketIOController";
import AudioManager from "./audio/AudioManager";
import MusicPlayer from "./audio/MusicPlayer";
import * as AuthManager from "./auth/AuthManager";
import NotificationService from "./auth/NotificationService";
import * as SessionManager from "./auth/SessionManager";
import CustomWebView from "./CustomWebView";
import GameUtils from "./GameUtils";
import { buildMicrositeGameUrl } from "./helpers/UrlHelper";
import JoinGameHelper from "./JoinGameHelper";

const { ccclass, property } = cc._decorator;

declare global {
    interface Window {
        microsite: any;
        isUserGesture: boolean;
    }
}

export type MicrositeGameParams = {
    backLobby?: boolean;
    ss?: string;
    time?: number;
    username?: string;
    isAuthenticated?: boolean;
    memberName?: string;
    language?: string;
    musicEnable?: boolean;
    sfxEnable?: boolean;
    sessionTimeout?: boolean;
    copyToClipboard?: string;
    hasSSO?: boolean;
    getGameName?: number;
    replaceUrl?: string;
    gameId?: number;
    promotion?: string;
    clearQueryStringOnUrl?: boolean;
    splashEnabled?: boolean;
    isUserGesture?: boolean;
    operator?: string;
    loadStorage?: { key: string };
    saveStorage?: { [key: string]: any };
    syncSession?: ISessionInfo;
};

interface ISessionInfo {
    isAuthenticated: boolean;
    username: string;
    language: string;
    session: string;
    system: number;
    memberName?: string;
    ssoTime?: Date;
}

const WebviewEventType = {
    LOADING: "loading"
};

@ccclass
export default class BaseMicrositeGame extends cc.Component {
    @property(CustomWebView)
    webview: CustomWebView = null;

    private readonly MusicStorageKey = "SOUND_BACKGROUND";
    private readonly SFXStorageKey = "SOUND_GAME";
    private micrositeUrl = "";
    private isLoadingLobby = false;

    @lazyInject(SocketIOController)
    private readonly socketIOControler: SocketIOController;

    protected gameId = 0;
    protected onLoad(): void {
        console.log("🌐 [BaseMicrositeGame] ===== onLoad started =====");
        const startTime = Date.now();

        this.gameId = SessionManager.getMicrositeGameId();
        console.log("🌐 [BaseMicrositeGame] Game ID from session:", this.gameId);

        console.log("🌐 [BaseMicrositeGame] Stopping main action...");
        this.stopMainAction();

        console.log("🌐 [BaseMicrositeGame] Loading microsite game...");
        this.loadMicrositeGame();

        console.log("🌐 [BaseMicrositeGame] Setting up message event listener...");
        window.addEventListener("message", this.handleEventFromMicrosite);

        console.log("🌐 [BaseMicrositeGame] Setting up webview loading event...");
        this.webview?.node.on(
            WebviewEventType.LOADING,
            () => {
                console.log("🌐 [BaseMicrositeGame] Webview loading event triggered, setting iframe ID");
                this.webview._impl._iframe.id = "microsite";
            },
            this
        );

        const endTime = Date.now();
        console.log("🌐 [BaseMicrositeGame] ===== onLoad completed in", (endTime - startTime), "ms =====");
    }

    setCanvasVisibilty(active: boolean) {
        GameUtils.setCanvasVisibilty(active);
    }

    protected onDestroy(): void {
        window.microsite = {};
        this.removeMicrositeListeners();
    }

    private removeMicrositeListeners() {
        window.removeEventListener("message", this.handleEventFromMicrosite);
    }

    protected stopMainAction() {
        const audio = AudioManager.getInstance();
        audio.stopMusic();
        audio.stopAllSFX();
        const musicPlayer = MusicPlayer.getInstance();
        musicPlayer.stopBackgroundAudio();
        cc.log("stop main action -------------");
        NotificationService.getInstance().forceKickedOut();
        AuthManager.removeRecheckInInterval();
    }

    protected loadMicrositeGame() {
        console.log("🌐 [BaseMicrositeGame] ===== loadMicrositeGame started =====");
        const startTime = Date.now();

        this.micrositeUrl = buildMicrositeGameUrl(this.gameId);
        console.log("🌐 [BaseMicrositeGame] Microsite URL built:", this.micrositeUrl);

        let queryString = this.getMicrositeGameQueryString();
        console.log("🌐 [BaseMicrositeGame] Initial query string:", queryString);

        if (queryString && queryString.length > 0) {
            queryString += "&hideFullscreen=true";
        } else {
            queryString = "?hideFullscreen=true";
        }

        console.log("🌐 [BaseMicrositeGame] Final query string with hideFullscreen:", queryString);

        const finalUrl = `${this.micrositeUrl}/${queryString}`;
        console.log("🌐 [BaseMicrositeGame] Final microsite URL:", finalUrl);

        if (this.webview) {
            console.log("🌐 [BaseMicrositeGame] Setting webview URL...");
            this.webview.url = finalUrl;
        } else {
            console.error("🌐 [BaseMicrositeGame] ❌ Webview component not found!");
        }

        const endTime = Date.now();
        console.log("🌐 [BaseMicrositeGame] ===== loadMicrositeGame completed in", (endTime - startTime), "ms =====");
    }

    handleEventFromMicrosite = async ({ data }: { data: MicrositeGameParams }) => {
        console.log("🌐 [BaseMicrositeGame] ===== handleEventFromMicrosite started =====");
        const startTime = Date.now();

        console.log("🌐 [BaseMicrositeGame] Received event data:", {
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : [],
            eventType: this.getEventType(data)
        });

        if (data.replaceUrl) {
            console.log("🌐 [BaseMicrositeGame] 🔄 Replace URL event:", data.replaceUrl);
            window.location.replace(data.replaceUrl);
            return;
        }

        if (data.splashEnabled) {
            console.log("🌐 [BaseMicrositeGame] 🎨 Splash enabled event");
            this.setCanvasVisibilty(false);
            this.handleUserGesturePage();
            this.handleClearStorage();
            const className = "microsite-iframe";
            if (!this.webview?._impl?._iframe?.classList?.contains(className)) {
                console.log("🌐 [BaseMicrositeGame] Adding microsite-iframe class to iframe");
                this.webview?._impl?._iframe?.classList?.add(className);
            }
            return;
        }

        if (data.hasSSO) {
            console.log("🌐 [BaseMicrositeGame] 🔐 Has SSO event");
            window.microsite = { hasSSO: true };
            return;
        }

        if (data.sessionTimeout) {
            console.log("🌐 [BaseMicrositeGame] ⏰ Session timeout event");
            this.handleSignOut();
            this.removeMicrositeListeners();
            return;
        }

        if (data.backLobby && !this.isLoadingLobby) {
            console.log("🌐 [BaseMicrositeGame] 🏠 Back to lobby event");
            this.isLoadingLobby = true;
            this.setCanvasVisibilty(true);
            await this.handleBackToLobby(data);
            return;
        }

        if (data.getGameName) {
            console.log("🌐 [BaseMicrositeGame] 🎮 Get game name event:", data.getGameName);
            this.getGameName(data.getGameName, data.language);
            return;
        }

        if (data.copyToClipboard) {
            console.log("🌐 [BaseMicrositeGame] 📋 Copy to clipboard event:", data.copyToClipboard);
            this.handleCopyToClipboard(data.copyToClipboard);
            return;
        }

        if (data.clearQueryStringOnUrl) {
            console.log("🌐 [BaseMicrositeGame] 🧹 Clear query string event");
            AuthManager.clearQueryStringOnUrl();
        }

        if (data.isUserGesture) {
            console.log("🌐 [BaseMicrositeGame] 👆 User gesture event");
            AudioManager.getInstance().isUserGesture = true;
            window.isUserGesture = true;
        }

        if (data.loadStorage) {
            console.log("🌐 [BaseMicrositeGame] 📥 Load storage event:", data.loadStorage);
            this.handleLoadStorage(data);
        }

        if (data.saveStorage) {
            console.log("🌐 [BaseMicrositeGame] 📤 Save storage event:", data.saveStorage);
            this.handleSaveStorage(data);
        }

        if (data.syncSession) {
            console.log("🌐 [BaseMicrositeGame] 🔄 Sync session event");
            this.syncSession(data.syncSession);
        }

        console.log("🌐 [BaseMicrositeGame] Handling operator and audio changes...");
        this.handleOperator();
        this.handleChangeAudio(data);

        const endTime = Date.now();
        console.log("🌐 [BaseMicrositeGame] ===== handleEventFromMicrosite completed in", (endTime - startTime), "ms =====");
    };

    private getEventType(data: MicrositeGameParams): string {
        if (data.replaceUrl) return "replaceUrl";
        if (data.splashEnabled) return "splashEnabled";
        if (data.hasSSO) return "hasSSO";
        if (data.sessionTimeout) return "sessionTimeout";
        if (data.backLobby) return "backLobby";
        if (data.getGameName) return "getGameName";
        if (data.copyToClipboard) return "copyToClipboard";
        if (data.clearQueryStringOnUrl) return "clearQueryStringOnUrl";
        if (data.isUserGesture) return "isUserGesture";
        if (data.loadStorage) return "loadStorage";
        if (data.saveStorage) return "saveStorage";
        if (data.syncSession) return "syncSession";
        return "unknown";
    }

    private syncSession(params: ISessionInfo) {
        if (!params) {
            return;
        }
        const session: any = SessionManager.getSession() || {};
        session.ss = params.session;
        session.isAuthenticated = params.isAuthenticated ?? false;
        session.memberName = params.memberName;
        session.username = params.username;
        session.language = params.language;
        session.system = params.system;
        session.time = params.ssoTime;
        SessionManager.storeSessionData(session);
    }

    private handleLoadStorage(data: MicrositeGameParams) {
        const { key } = data.loadStorage;
        cc.log("microsite load storage ", key);
        this.postMessageToMicrosite({
            loadStorage: {
                key: StorageManager.get(key)
            }
        });
    }

    private handleSaveStorage(data: MicrositeGameParams) {
        const storage = data.saveStorage;
        const keys = Object.keys(storage);
        cc.log("microsite save storage ", keys);
        for (const key of Object.keys(storage)) {
            StorageManager.set(key, storage[key]);
        }
    }

    protected getMicrositeGameQueryString() {
        return "";
    }

    protected async handleBackToLobby(data: MicrositeGameParams) {
        const currentGameId = this.gameId;
        SessionManager.removeMicrositeGameId();
        await this.updateSession(data);
        AudioManager.getInstance().initDefaultStorage();

        if (data.gameId > 0) {
            await this.onClickJoinGame(data.gameId);
            if (!isMicroSite(data.gameId)) {
                await this.handleBackFromMicrositeGame();
            }
            return;
        }

        if (isGatewayGame(currentGameId)) {
            const gameConfiguration = getGameConfiguration(currentGameId);
            const mainId = gameConfiguration.gateway?.id;

            const onConnected = async () => {
                await this.handleBackFromMicrositeGame();
            };
            GameUtils.openSocketGatewayGame(mainId, this.socketIOControler, onConnected);
            return;
        }

        this.loadLobbyScene();
    }

    protected async handleBackFromMicrositeGame() {
        await appManager.initNotificationService();
    }

    protected async updateSession(session: MicrositeGameParams) {
        //
    }

    protected loadLobbyScene() {
        //
    }

    private handleChangeAudio(data: MicrositeGameParams) {
        data.musicEnable !== undefined && StorageManager.set(this.MusicStorageKey, data.musicEnable);
        data.sfxEnable !== undefined && StorageManager.set(this.SFXStorageKey, data.sfxEnable);
    }

    private handleOperator() {
        const operator = SessionManager.getOperator();
        if (operator) {
            this.postMessageToMicrosite({ op: operator });
        }
    }

    private handleSignOut() {
        SessionManager.removeMicrositeGameId();
        SessionManager.removeSession();
    }

    private postMessageToMicrosite(data: any) {
        this.webview?._impl._iframe.contentWindow.postMessage(data, this.micrositeUrl);
    }

    private async handleCopyToClipboard(text: string) {
        const copySuccessfully = await GameUtils.copyText(text);
        this.postMessageToMicrosite({ copySuccessfully });
    }

    private async getGameName(gameId: number, language = "en") {
        window.gameConfigurations === undefined && (await initGameConfiguration());
        i18n.init(language);
        const gameName = await GameUtils.getDisplayGameName(gameId);
        this.postMessageToMicrosite({ gameName, gameId });
    }

    protected async onClickJoinGame(gameId: number) {
        const joinGameHelper = new JoinGameHelper();
        if (GameUtils.isMiniGame(gameId.toString())) {
            cc.director.loadScene("Lobby", () => {
                GameUtils.openGame(joinGameHelper.getGameId(gameId), appManager.miniPanel);
            });
        } else {
            await joinGameHelper.joinGameIsNotMiniGame(gameId, this.socketIOControler);
        }
    }

    private async handleClearStorage() {
        const isClearStorage = SessionManager.getClearStorageMicroSite();
        if (isClearStorage) {
            SessionManager.clearStorageMicroSite(false);
            this.postMessageToMicrosite({ isClearStorage });
        }
    }

    private async handleUserGesturePage() {
        const isUserGesture = AudioManager.getInstance().isUserGesture;
        this.postMessageToMicrosite({ isUserGesture });
    }
}

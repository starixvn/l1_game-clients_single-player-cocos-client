import { appContainer } from "../../../Application";
import MusicPlayer from "../../../common/audio/MusicPlayer";
import * as sessionManager from "../../../common/auth/SessionManager";
import GameUtils from "../../../common/GameUtils";
import { truncateFixedDecimals } from "../../../common/helpers/NumberHelper";
import Loading from "../../../common/loading/view-models/Loading";
import LobbyUtils from "../../../common/LobbyUtils";
import UserProfile from "../../../common/user-profile/UserProfile";
import { getGameConfiguration, isGatewayGame } from "../../../configs/GameConfigurations";
import LobbyMenuConfig from "../../../lobby/main/view-models/LobbyMenuConfig";
import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";
import SplashConfig from "../../../splash/view-models/SplashConfig";

export const loadMiniPanel = (game: any) => () => {
    if (!game.miniPanelPrefab) {
        return;
    }
    const miniPanel = cc.instantiate(game.miniPanelPrefab);
    game.currentMiniPanel = miniPanel.getComponent("MiniPanel");
    game.currentMiniPanel.currentGameRoomId = game.gameId;
    sessionManager.storeInRoomGameId(game.gameId);
    game.miniPanelContainer.addChild(miniPanel);
};

export const handleMusicWhenJoinGame = (game: any) => async () => {
    const musicPlayer = MusicPlayer.getInstance();
    if (game.isOwnGameMusicBackground) {
        musicPlayer.isJoinRoomMusic = true;
        await GameUtils.asyncExecute(game?.node, musicPlayer.decreaseVolumeAndStopBackgroundMusic());
    } else {
        if (!musicPlayer.initialized) {
            musicPlayer.init();
        }
    }
};

export const loadUserData = (game: any) => (user: any) => {
    if (!user) {
        return;
    }

    if (!game.isAlive()) {
        return;
    }

    if (void 0 !== user.name) {
        game.userProfile && game.userProfile.setUserName(user.name);
    }

    if (void 0 !== user.red) {
        game.userProfile && game.userProfile.setUserBalance(truncateFixedDecimals(user.red, 2));
    }

    if (void 0 !== user.avatarId) {
        GameUtils.getAvatarSprite(user.avatarId).then((frame) => {
            if (game?.node && frame) {
                game.userProfile && game.userProfile.setUserAvatar(frame);
            }
        });
    }
};

export const onUserProfileInitialized = (game: any) => (node: cc.Node) => {
    const userProfile = node.getComponent(UserProfile);
    if (userProfile) {
        game.userProfile = userProfile;
    }
};

export const outRoomGame = (game: any) => () => {
    return new Promise<void>((resolve) => {
        const tweenNodeName = "out-game-tween-node";
        let outGameTweenNode = game.node.getChildByName(tweenNodeName);
        if (!outGameTweenNode) {
            outGameTweenNode = new cc.Node(tweenNodeName);
            game.node.addChild(outGameTweenNode);
        }
        outGameTweenNode.stopAllActions();
        function callback() {
            game.socketIOController.closeMiniGameSockets();
            game.stopGame();
            resolve();
        }
        outGameTweenNode.runAction(
            cc.sequence(
                cc.delayTime(1),
                cc.callFunc(() => callback())
            )
        );
    });
};

const handleGoToOtherScene = (game: any, isDirectMode: boolean, isGameShow: boolean) => {
    if (isDirectMode) {
        if (isGameShow && game?.closeGameByClick) {
            appManager.backToOperatorLobby();
        } else if (!game.openOtherScene) {
            cc.director.loadScene("Splash");
        }
    } else {
        uiManager.isPauseLoadingIcons = false;
        const gameId = game.gameId;
        if (isGatewayGame(gameId)) {
            cc.log("Open gateway lobby from game V2");
            const gameConfiguration = getGameConfiguration(gameId);
            const mainId = gameConfiguration.gateway?.id;
            GameUtils.openSocketGatewayGame(mainId, game.currentMiniPanel.socketIOController);
            appManager.clearSSOGameId();
            return;
        }

        const lobbyMenuConfig = appContainer.get(LobbyMenuConfig);
        const splashConfig = appContainer.get(SplashConfig);
        const loading = game?.loading?.getComponent(Loading);
        const onProgress = loading
            ? (completed, total) => {
                  loading.onProgress(completed, total);
              }
            : null;
        LobbyUtils.gotoLobbyScene(onProgress, lobbyMenuConfig, splashConfig);
    }
};

export const closeGame = (game: any) => () => {
    if (game.closingGameRoom || !game.node.activeInHierarchy) {
        return;
    }
    game.closingGameRoom = true;

    if (game.loading) {
        game.loading.active = true;
    }
    if (game.musicBg) {
        MusicPlayer.getInstance().handleIncreaseVolume();
    }

    const isGameShow = appManager.GAME_IS_SHOWED;
    game.outRoomGame().then(() => {
        const isDirectMode = appManager.isDirectMode;
        if (!game.isGameHide) {
            sessionManager.removeInRoomGameId();
        }

        handleGoToOtherScene(game, isDirectMode, isGameShow);
    });
};

export const leaveGameRoom = (game: any) => () => {
    game.closeGame();
};

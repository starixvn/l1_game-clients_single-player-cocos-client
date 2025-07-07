import axios from "axios";

import { buildClientUrl } from "../common/helpers/UrlHelper";
import { uiManager } from "../managers/GameUIManager";
import { InternalEvents } from "../managers/InternalEvents";
import { delayTime } from "../utils";

export interface GameConfiguration {
    id: number;
    name: string;
    key: string;
    route?: string;
    mini?: {
        miniPanel: boolean;
        multi?: string;
    };
    remoteBundle?: {
        dependsOn: string[];
    };
    isMicrosite?: boolean;
    bannerType?: string;
    gateway?: {
        id: number;
    };
}

declare global {
    interface Window {
        gameConfigurations: GameConfiguration[];
    }
}

export async function initialize() {
    const url = buildClientUrl("/game/configurations/");
    let configurations;
    let retryCount = 0;

    while (retryCount < 3) {
        cc.log("Try load configuration ", retryCount + 1);
        configurations = await axios
            .get(url)
            .then((response) => response.data)
            .catch(() => []);

        if (configurations.length > 0) {
            break;
        }
        retryCount++;
        await delayTime(3);
    }

    if (configurations.length === 0) {
        uiManager.emitter.emit(InternalEvents.SSO_FAILED);
        throw new Error(`Can not load client bundle configuration`);
    }

    window.gameConfigurations = configurations;

    initializeBundleInfos();
}

function initializeBundleInfos() {
    const isDevelopmentMode = window.location.hostname === "localhost";
    const games = getAllGameConfigurations()
        .filter((configuration) => !!configuration.remoteBundle)
        .map((configuration) => ({ gameId: configuration.id, ...configuration.remoteBundle }));

    const developmentMode = games.reduce((result, configs) => {
        result[configs.gameId] = {
            url: "assets",
            name: configs.gameId,
            useMd5Cache: location.href.includes("/build/"),
            dependencies: configs.dependsOn
        };

        return result;
    }, {});

    const productionMode = games.reduce((result, configs) => {
        result[configs.gameId] = {
            url: buildClientUrl(`/game-client-${configs.gameId}`),
            name: configs.gameId,
            useMd5Cache: true,
            dependencies: configs.dependsOn
        };

        return result;
    }, {});

    if (!window.bundleManagement) {
        window.bundleManagement = {};
    }

    window.bundleManagement.bundles = isDevelopmentMode ? developmentMode : productionMode;
}

export function getGameName(gameId: number) {
    const gameConfiguration = getGameConfiguration(gameId);

    return gameConfiguration?.key;
}

export function getGameId(key: string) {
    const gameConfiguration = getAllGameConfigurations().find((configuration) => configuration.key === key);

    return gameConfiguration?.id;
}

export function isMiniGame(key: string) {
    const gameConfiguration = getAllGameConfigurations().find((configuration) => configuration.key === key);
    return !!gameConfiguration?.mini;
}

export function isMiniGameByGameId(gameId: number | string) {
    const gameConfiguration = getGameConfiguration(gameId);
    return !!gameConfiguration?.mini;
}

export function getGameConfiguration(gameId: number | string) {
    return getAllGameConfigurations().find((configuration) => configuration.id === Number(gameId));
}

export function isGatewayGame(gameId: number) {
    const gameConfiguration = getGameConfiguration(gameId);
    return gameConfiguration?.gateway;
}

export function isMicroSite(gameId: number) {
    const gameConfiguration = getGameConfiguration(gameId);
    return !!gameConfiguration?.isMicrosite && !gameConfiguration?.mini;
}

export function getAllGameConfigurations() {
    if (CC_EDITOR) {
        return [];
    }

    return window.gameConfigurations;
}

export function isUsingRemoteBundle(gameId: number) {
    const configuration = getGameConfiguration(gameId);

    return configuration && !!configuration.remoteBundle;
}

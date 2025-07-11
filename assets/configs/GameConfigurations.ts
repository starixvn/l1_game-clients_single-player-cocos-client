import axios from "axios";

import { buildClientUrl } from "../common/helpers/UrlHelper";
import { uiManager } from "../managers/GameUIManager";
import { InternalEvents } from "../managers/InternalEvents";
import { delayTime } from "../utils";

console.log("[GameConfigurations] Loading GameConfigurations module...");

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
    console.log("[GameConfigurations] Initializing game configurations...");
    const url = buildClientUrl("/game/configurations/");
    console.log("[GameConfigurations] Configuration URL:", url);

    let configurations;
    let retryCount = 0;

    while (retryCount < 3) {
        console.log("[GameConfigurations] Try load configuration", retryCount + 1);
        cc.log("Try load configuration ", retryCount + 1);
        try {
            configurations = await axios
                .get(url)
                .then((response) => {
                    console.log("[GameConfigurations] Configuration response received:", response.data);
                    return response.data;
                })
                .catch((error) => {
                    console.error("[GameConfigurations] Configuration request failed:", error);
                    return [];
                });

            if (configurations.length > 0) {
                console.log("[GameConfigurations] Configuration loaded successfully, count:", configurations.length);
                break;
            }
        } catch (error) {
            console.error("[GameConfigurations] Error loading configuration:", error);
        }

        retryCount++;
        console.log("[GameConfigurations] Retrying in 3 seconds...");
        await delayTime(3);
    }

    if (configurations.length === 0) {
        console.error("[GameConfigurations] Failed to load configurations after retries");
        uiManager.emitter.emit(InternalEvents.SSO_FAILED);
        throw new Error(`Can not load client bundle configuration`);
    }

    console.log("[GameConfigurations] Setting window.gameConfigurations");
    window.gameConfigurations = configurations;

    console.log("[GameConfigurations] Initializing bundle infos...");
    initializeBundleInfos();
    console.log("[GameConfigurations] Game configurations initialization completed");
}

function initializeBundleInfos() {
    console.log("[GameConfigurations] Initializing bundle infos...");
    const isDevelopmentMode = window.location.hostname === "localhost";
    console.log("[GameConfigurations] Is development mode:", isDevelopmentMode);

    const games = getAllGameConfigurations()
        .filter((configuration) => !!configuration.remoteBundle)
        .map((configuration) => ({ gameId: configuration.id, ...configuration.remoteBundle }));

    console.log("[GameConfigurations] Games with remote bundles:", games);

    const developmentMode = games.reduce((result, configs) => {
        console.log("[GameConfigurations] Processing development mode for gameId:", configs.gameId);
        result[configs.gameId] = {
            url: "assets",
            name: configs.gameId,
            useMd5Cache: location.href.includes("/build/"),
            dependencies: configs.dependsOn
        };

        return result;
    }, {});

    const productionMode = games.reduce((result, configs) => {
        console.log("[GameConfigurations] Processing production mode for gameId:", configs.gameId);
        result[configs.gameId] = {
            url: buildClientUrl(`/game-client-${configs.gameId}`),
            name: configs.gameId,
            useMd5Cache: true,
            dependencies: configs.dependsOn
        };

        return result;
    }, {});

    if (!window.bundleManagement) {
        console.log("[GameConfigurations] Creating window.bundleManagement");
        window.bundleManagement = {};
    }

    window.bundleManagement.bundles = isDevelopmentMode ? developmentMode : productionMode;
    console.log("[GameConfigurations] Bundle management configured:", window.bundleManagement.bundles);
}

export function getGameName(gameId: number) {
    console.log("[GameConfigurations] Getting game name for gameId:", gameId);
    const gameConfiguration = getGameConfiguration(gameId);
    const gameName = gameConfiguration?.key;
    console.log("[GameConfigurations] Game name resolved:", gameName);
    return gameName;
}

export function getGameId(key: string) {
    console.log("[GameConfigurations] Getting game ID for key:", key);
    const gameConfiguration = getAllGameConfigurations().find((configuration) => configuration.key === key);
    const gameId = gameConfiguration?.id;
    console.log("[GameConfigurations] Game ID resolved:", gameId);
    return gameId;
}

export function isMiniGame(key: string) {
    console.log("[GameConfigurations] Checking if mini game for key:", key);
    const gameConfiguration = getAllGameConfigurations().find((configuration) => configuration.key === key);
    const isMini = !!gameConfiguration?.mini;
    console.log("[GameConfigurations] Is mini game:", isMini);
    return isMini;
}

export function isMiniGameByGameId(gameId: number | string) {
    console.log("[GameConfigurations] Checking if mini game for gameId:", gameId);
    const gameConfiguration = getGameConfiguration(gameId);
    const isMini = !!gameConfiguration?.mini;
    console.log("[GameConfigurations] Is mini game by ID:", isMini);
    return isMini;
}

export function getGameConfiguration(gameId: number | string) {
    console.log("[GameConfigurations] Getting game configuration for gameId:", gameId);
    const configuration = getAllGameConfigurations().find((configuration) => configuration.id === Number(gameId));
    console.log("[GameConfigurations] Game configuration found:", !!configuration);
    return configuration;
}

export function isGatewayGame(gameId: number) {
    console.log("[GameConfigurations] Checking if gateway game for gameId:", gameId);
    const gameConfiguration = getGameConfiguration(gameId);
    const isGateway = !!gameConfiguration?.gateway;
    console.log("[GameConfigurations] Is gateway game:", isGateway);
    return gameConfiguration?.gateway;
}

export function isMicroSite(gameId: number) {
    console.log("[GameConfigurations] Checking if microsite for gameId:", gameId);
    const gameConfiguration = getGameConfiguration(gameId);
    const isMicrosite = !!gameConfiguration?.isMicrosite && !gameConfiguration?.mini;
    console.log("[GameConfigurations] Is microsite:", isMicrosite);
    return isMicrosite;
}

export function getAllGameConfigurations() {
    console.log("[GameConfigurations] Getting all game configurations");
    if (CC_EDITOR) {
        console.log("[GameConfigurations] In editor mode, returning empty array");
        return [];
    }

    const configurations = window.gameConfigurations;
    console.log("[GameConfigurations] Total configurations available:", configurations?.length || 0);
    return configurations;
}

export function isUsingRemoteBundle(gameId: number) {
    console.log("[GameConfigurations] Checking if using remote bundle for gameId:", gameId);
    const configuration = getGameConfiguration(gameId);
    const usesRemoteBundle = configuration && !!configuration.remoteBundle;
    console.log("[GameConfigurations] Uses remote bundle:", usesRemoteBundle);
    return usesRemoteBundle;
}

console.log("[GameConfigurations] GameConfigurations module loaded successfully");

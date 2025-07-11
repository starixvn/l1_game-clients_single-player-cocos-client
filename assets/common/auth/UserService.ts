import axios from "axios";
import UserServiceClient from "sc-user-service-client";

import * as sessionManager from "../../common/auth/SessionManager";
import * as Configs from "../../configs/Configs";
import { AXIOS_FAILED_PREFIX } from "../../utils";
import { buildUrlWithPath } from "../helpers/UrlHelper";
import { sentryLogger } from "../logger";
import { updateUserBalance } from "./AuthManager";

console.log("[UserService] Loading UserService module...");

export default class UserService {
    private static readonly instance: UserServiceClient;

    public static getInstance(): UserServiceClient {
        console.log("[UserService] Getting UserService instance...");
        if (!this.instance) {
            console.log("[UserService] Creating new UserServiceClient instance");
            const userServiceUrl = this.getUserServiceUrl();
            console.log("[UserService] User service URL:", userServiceUrl);
            return new UserServiceClient(userServiceUrl);
        } else {
            console.log("[UserService] Returning existing UserServiceClient instance");
            return this.instance;
        }
    }

    public static getGameResultUrl(gameId: number = undefined) {
        console.log("[UserService] Getting game result URL for gameId:", gameId);
        return new Promise((resolve) => {
            const request = this.getRequestOptions();
            request["language"] = sessionManager.getLocale();
            if (gameId) {
                request["gameId"] = gameId;
            }
            console.log("[UserService] Request options:", request);

            const url = `${this.getUserServiceUrl()}/game-result/access-url`;
            console.log("[UserService] Making POST request to:", url);

            axios
                .post(url, request)
                .then((response) => {
                    console.log("[UserService] Game result URL request successful");
                    const redirectUrl = response.data.gameResult.redirectUrl;
                    console.log("[UserService] Game result redirect URL:", redirectUrl);
                    resolve(redirectUrl);
                })
                .catch((error) => {
                    console.error("[UserService] Error getting game result URL:", error.message);
                    cc.warn(error.message);
                    sentryLogger.log(`${AXIOS_FAILED_PREFIX} getGameResultUrl ${gameId}: ${error.message}`);
                });
        });
    }

    public static getBalance() {
        console.log("[UserService] Getting user balance...");
        const request = this.getRequestOptions();
        console.log("[UserService] Balance request options:", request);

        const url = `${this.getUserServiceUrl()}/auth/balance`;
        console.log("[UserService] Making POST request to:", url);

        axios
            .post(url, request)
            .then((response) => {
                console.log("[UserService] Balance request successful");
                console.log("[UserService] Balance response data:", response.data);
                updateUserBalance(response.data);
                console.log("[UserService] User balance updated");
            })
            .catch((error) => {
                console.error("[UserService] Error getting balance:", error.message);
                cc.warn(error.message);
                sentryLogger.log(`${AXIOS_FAILED_PREFIX} getBalance: ${error.message}`);
            });
    }

    private static getUserServiceUrl(): string {
        console.log("[UserService] Getting user service URL...");
        const path = Configs.env === "" ? "/user" : `/${Configs.env}/user`;
        const url = buildUrlWithPath(path);
        console.log("[UserService] User service URL built:", url);
        return url;
    }

    private static getRequestOptions() {
        console.log("[UserService] Building request options...");
        const options = {
            session: window?.authData?.ss,
            username: window?.authData?.username,
            browserUserAgent: window?.navigator?.userAgent
        };
        console.log("[UserService] Request options built:", {
            session: !!options.session,
            username: options.username,
            userAgent: !!options.browserUserAgent
        });
        return options;
    }
}

console.log("[UserService] UserService module loaded successfully");

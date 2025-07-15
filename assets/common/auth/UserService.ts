import axios from "axios";
import UserServiceClient from "sc-user-service-client";

import * as sessionManager from "../../common/auth/SessionManager";
import * as Configs from "../../configs/Configs";
import { AXIOS_FAILED_PREFIX } from "../../utils";
import { buildUrlWithPath } from "../helpers/UrlHelper";
import { sentryLogger } from "../logger";
import { updateUserBalance } from "./AuthManager";



export default class UserService {
    private static readonly instance: UserServiceClient;

    public static getInstance(): UserServiceClient {

        if (!this.instance) {

            const userServiceUrl = this.getUserServiceUrl();

            return new UserServiceClient(userServiceUrl);
        } else {

            return this.instance;
        }
    }

    public static getGameResultUrl(gameId: number = undefined) {

        return new Promise((resolve) => {
            const request = this.getRequestOptions();
            request["language"] = sessionManager.getLocale();
            if (gameId) {
                request["gameId"] = gameId;
            }


            const url = `${this.getUserServiceUrl()}/game-result/access-url`;


            axios
                .post(url, request)
                .then((response) => {

                    const redirectUrl = response.data.gameResult.redirectUrl;

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

        const request = this.getRequestOptions();


        const url = `${this.getUserServiceUrl()}/auth/balance`;


        axios
            .post(url, request)
            .then((response) => {


                updateUserBalance(response.data);

            })
            .catch((error) => {
                console.error("[UserService] Error getting balance:", error.message);
                cc.warn(error.message);
                sentryLogger.log(`${AXIOS_FAILED_PREFIX} getBalance: ${error.message}`);
            });
    }

    private static getUserServiceUrl(): string {

        const path = Configs.env === "" ? "/user" : `/${Configs.env}/user`;
        const url = buildUrlWithPath(path);

        return url;
    }

    private static getRequestOptions() {

        const options = {
            session: window?.authData?.ss,
            username: window?.authData?.username,
            browserUserAgent: window?.navigator?.userAgent
        };
        return options;
    }
}



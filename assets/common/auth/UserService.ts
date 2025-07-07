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
        return this.instance ?? new UserServiceClient(this.getUserServiceUrl());
    }

    public static getGameResultUrl(gameId: number = undefined) {
        return new Promise((resolve) => {
            const request = this.getRequestOptions();
            request["language"] = sessionManager.getLocale();
            if (gameId) {
                request["gameId"] = gameId;
            }

            axios
                .post(`${this.getUserServiceUrl()}/game-result/access-url`, request)
                .then((response) => {
                    resolve(response.data.gameResult.redirectUrl);
                })
                .catch((error) => {
                    cc.warn(error.message);
                    sentryLogger.log(`${AXIOS_FAILED_PREFIX} getGameResultUrl ${gameId}: ${error.message}`);
                });
        });
    }

    public static getBalance() {
        const request = this.getRequestOptions();
        axios
            .post(`${this.getUserServiceUrl()}/auth/balance`, request)
            .then((response) => {
                updateUserBalance(response.data);
            })
            .catch((error) => {
                cc.warn(error.message);
                sentryLogger.log(`${AXIOS_FAILED_PREFIX} getBalance: ${error.message}`);
            });
    }

    private static getUserServiceUrl(): string {
        const path = Configs.env === "" ? "/user" : `/${Configs.env}/user`;
        return buildUrlWithPath(path);
    }

    private static getRequestOptions() {
        return {
            session: window?.authData?.ss,
            username: window?.authData?.username,
            browserUserAgent: window?.navigator?.userAgent
        };
    }
}

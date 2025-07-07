import * as i18n from "i18n/runtime-scripts/LanguageData";

import NotificationService from "../../common/auth/NotificationService";
import GameUtils from "../../common/GameUtils";
import { isSessionTimeoutError } from "../../common/helpers/ErrorCodeHelper";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { NoticeData } from "../../common/notice/view-models/Notice";
import { userManager } from "../../common/user/UserManager";
import NoticeUtil from "../../common/utils/NoticeUtil";
import { appManager } from "../../managers/AppManager";
import * as authManager from "./../../common/auth/AuthManager";
import { showMessageForExpiredToken } from "./../../common/auth/AuthManager";
import MiniPanel from "./MiniPanel";

declare global {
    interface Window {
        umInfo: any;
    }
}

export default class MiniPanelDataHandlers {
    constructor(private readonly main: MiniPanel) {}

    handleData(data) {
        if (data.mini) {
            this.handleData(data.mini);
        }

        if (data.kickedOut) {
            this.handleDataKickedOut(data.kickedOut);
        }

        if (data.apiError) {
            this.handleDataApiError(data);
        }

        if (data.reload) {
            this.main.setLoadingVisibility(false);
            this.main.onForceReload();
        }

        if (data.toGame && data.toGame !== cc.director.getScene().name) {
            this.main.loadGameRoom(data.toGame);
        }

        if (data.notice) {
            this.handleNoticeData(data.notice);
        }

        if (data.unauthorized) {
            this.main.setLoadingVisibility(false);
            this.main.forceKickedOut();
        }

        if (data.Authorized) {
            this.main.onSignIn();
        }

        if (data.notPermittedToPlay) {
            this.main.setLoadingVisibility(false);

            const gameId = data.gameId;
            const gameName = GameUtils.getGameNameString(gameId);
            const message = i18n.t("messages.gameExcluded", { gameName: gameName });
            this.main.onForceReload(true, message, gameId);
        }

        if (data.userStakeLevel && this.main.node.activeInHierarchy) {
            userManager.updateUserStakeLevel(data.userStakeLevel);
        }
    }

    handleDataKickedOut(data: any) {
        this.main.setLoadingVisibility(false);
        if (data.umInfo) {
            NotificationService.getInstance().forceKickedOut();
            window.umInfo = data.umInfo;
            authManager.redirectToUMPage();
        } else {
            if (data.isDisabledAccount) {
                setTimeout(() => {
                    if (authManager) {
                        this.main.forceKickedOut();
                    }
                }, 10000);
                const errorCode = data.errorCode;
                const text = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
                const noticeData = { text: text } as NoticeData;
                this.main.showNotice(noticeData, this.main.forceKickedOut, this.main.forceKickedOut);
            } else {
                this.main.forceKickedOut();
            }
        }
    }

    handleAuth(data: any) {
        if (data.authorized) {
            appManager.miniPanel?.onSignIn();
        } else {
            if (data.umInfo) {
                NotificationService.getInstance().forceKickedOut();
                window.umInfo = data.umInfo;
                authManager.redirectToUMPage();
            } else {
                this.main.forceKickedOut();
            }
        }
    }

    handleDataApiError(apiErrorData: any) {
        this.main.setLoadingVisibility(false);
        const error = apiErrorData.apiError;
        const gameId = error.gameTypeId;

        const errorCode = error.errorCode.toString();

        if (this.main.skipShowApiErrorGameIds.includes(gameId)) {
            return;
        }

        if (isSessionTimeoutError(errorCode)) {
            showMessageForExpiredToken(errorCode);
            return;
        }

        if (error.maxBet && error.maxBet > 0 && this.main.node.activeInHierarchy) {
            userManager.updateUserStakeLevel(error);
        }

        this.main.showErrorNotice(error);
    }

    handleNoticeData(notice: any) {
        this.main.setLoadingVisibility(false);
        const errorCode = notice.errorCode;
        const gameName = GameUtils.getGameNameString(notice.gameTypeId);
        const { minBet, maxBet, gameRoundId } = notice;
        const opt = { gameName, gameRoundId, errorCode, minBet: numberWithCommas(minBet), maxBet: numberWithCommas(maxBet) };
        const text = NoticeUtil.getLocalizedErrorMessage(errorCode, opt);
        if (text) {
            const noticeData = {
                text: text,
                isInfo: false
            } as NoticeData;
            this.main.showNotice(noticeData);
        }
    }
}

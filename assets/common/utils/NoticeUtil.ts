import * as i18n from "i18n/runtime-scripts/LanguageData";

import { getLocale } from "../../common/auth/SessionManager";
import ErrorCodeDictionary, { CommonErrorCodeList } from "./ErrorCodeDictionary";

export default class NoticeUtil {
    public static getCurrentLanguage(): string {
        return window.i18n.curLang;
    }

    public static getSuffixSpriteName(): string {
        let suffix = "";
        const lang = NoticeUtil.getCurrentLanguage();
        if (lang !== "vi") {
            suffix += `_${lang}`;
        }
        return suffix;
    }

    public static getLocalizedErrorMessage(errorCode: string, opt: any, isPlaceBet = false): string {
        if (!ErrorCodeDictionary[errorCode]) {
            console.error(`not found error code ${errorCode}`);
            return i18n.t("messages.errorOccurred", opt);
        }
        let key = `messages.${ErrorCodeDictionary[errorCode]}`;
        const isCommonErrorCode = CommonErrorCodeList.includes(errorCode);
        if (isCommonErrorCode && isPlaceBet) {
            key += "PlaceBet";
        }
        return i18n.t(key, opt);
    }

    public static getMessageByLocale(data: any): string {
        const locale = getLocale();
        return data[locale] || data["en-US"];
    }
}

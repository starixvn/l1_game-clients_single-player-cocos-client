import * as i18n from "i18n/runtime-scripts/LanguageData";

import { getLocale } from "../../common/auth/SessionManager";
import ErrorCodeDictionary, { CommonErrorCodeList } from "./ErrorCodeDictionary";

console.log("[NoticeUtil] Loading NoticeUtil module...");

export default class NoticeUtil {
    public static getCurrentLanguage(): string {
        const currentLang = window.i18n.curLang;
        console.log("📢 [NoticeUtil] Getting current language:", currentLang);
        return currentLang;
    }

    public static getSuffixSpriteName(): string {
        console.log("📢 [NoticeUtil] Getting suffix sprite name");
        let suffix = "";
        const lang = NoticeUtil.getCurrentLanguage();
        console.log("📢 [NoticeUtil] Current language for sprite suffix:", lang);

        if (lang !== "vi") {
            suffix += `_${lang}`;
            console.log("📢 [NoticeUtil] Non-Vietnamese language, adding suffix:", suffix);
        } else {
            console.log("📢 [NoticeUtil] Vietnamese language, no suffix needed");
        }

        console.log("📢 [NoticeUtil] Final suffix sprite name:", suffix);
        return suffix;
    }

    public static getLocalizedErrorMessage(errorCode: string, opt: any, isPlaceBet = false): string {
        console.log("📢 [NoticeUtil] Getting localized error message for code:", errorCode, "options:", opt, "isPlaceBet:", isPlaceBet);

        if (!ErrorCodeDictionary[errorCode]) {
            console.error("📢 [NoticeUtil] Error code not found in dictionary:", errorCode);
            const fallbackMessage = i18n.t("messages.errorOccurred", opt);
            console.log("📢 [NoticeUtil] Using fallback error message:", fallbackMessage);
            return fallbackMessage;
        }

        let key = `messages.${ErrorCodeDictionary[errorCode]}`;
        console.log("📢 [NoticeUtil] Base error message key:", key);

        const isCommonErrorCode = CommonErrorCodeList.includes(errorCode);
        console.log("📢 [NoticeUtil] Is common error code:", isCommonErrorCode);

        if (isCommonErrorCode && isPlaceBet) {
            key += "PlaceBet";
            console.log("📢 [NoticeUtil] Adding PlaceBet suffix to key:", key);
        }

        const localizedMessage = i18n.t(key, opt);
        console.log("📢 [NoticeUtil] Localized error message:", localizedMessage);
        return localizedMessage;
    }

    public static getMessageByLocale(data: any): string {
        console.log("📢 [NoticeUtil] Getting message by locale, data:", data);
        const locale = getLocale();
        console.log("📢 [NoticeUtil] Current locale:", locale);

        const message = data[locale] || data["en-US"];
        console.log("📢 [NoticeUtil] Selected message:", message);
        return message;
    }
}

console.log("[NoticeUtil] NoticeUtil module loaded successfully");

import * as i18n from "i18n/runtime-scripts/LanguageData";

import { getLocale } from "../../common/auth/SessionManager";
import ErrorCodeDictionary, { CommonErrorCodeList } from "./ErrorCodeDictionary";



export default class NoticeUtil {
    public static getCurrentLanguage(): string {
        const currentLang = window.i18n.curLang;
        
        return currentLang;
    }

    public static getSuffixSpriteName(): string {
        
        let suffix = "";
        const lang = NoticeUtil.getCurrentLanguage();
        

        if (lang !== "vi") {
            suffix += `_${lang}`;
            
        } else {
            
        }

        
        return suffix;
    }

    public static getLocalizedErrorMessage(errorCode: string, opt: any, isPlaceBet = false): string {
        

        if (!ErrorCodeDictionary[errorCode]) {
            console.error("📢 [NoticeUtil] Error code not found in dictionary:", errorCode);
            const fallbackMessage = i18n.t("messages.errorOccurred", opt);
            
            return fallbackMessage;
        }

        let key = `messages.${ErrorCodeDictionary[errorCode]}`;
        

        const isCommonErrorCode = CommonErrorCodeList.includes(errorCode);
        

        if (isCommonErrorCode && isPlaceBet) {
            key += "PlaceBet";
            
        }

        const localizedMessage = i18n.t(key, opt);
        
        return localizedMessage;
    }

    public static getMessageByLocale(data: any): string {
        
        const locale = getLocale();
        

        const message = data[locale] || data["en-US"];
        
        return message;
    }
}



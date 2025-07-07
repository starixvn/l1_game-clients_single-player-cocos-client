import { i18n } from "../../ClientModules";

function isI18NInitialized(language: string) {
    return window.i18n?.languages && window.i18n?.languages[language];
}

function waitForReloadingI18N(language: string, phrases: Record<string, unknown>) {
    const refreshRate = 1000 / 60;

    function startInterval() {
        if (isI18NInitialized(language)) {
            reloadLanguageData(language, phrases);
        } else {
            setTimeout(startInterval, refreshRate);
        }
    }

    startInterval();
}

export function reloadLanguageData(language: string, phrases: Record<string, unknown>) {
    if (!isI18NInitialized(language)) {
        waitForReloadingI18N(language, phrases);
        return;
    }

    Object.entries(phrases).forEach(([key, data]) => {
        if (window.i18n.languages[language][key]) {
            window.i18n.languages[language][key] = Object.assign({}, window.i18n.languages[language][key], data);
        } else {
            window.i18n.languages[language][key] = data;
        }
    });

    if (language === window.i18n.curLang) {
        const data = window.i18n.languages[window.i18n.curLang] || {};

        i18n?.inst?.replace(data);
    }
}

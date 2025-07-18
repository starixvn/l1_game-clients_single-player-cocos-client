function initGameEngine() {
    if (typeof VConsole !== "undefined") {
        window.vConsole = new VConsole();
    }

    const debug = window._CCSettings.debug;
    const splash = document.getElementById("splash");
    splash.style.display = "block";

    function loadScript(moduleName, cb) {
        function scriptLoaded() {
            document.body.removeChild(domScript);
            domScript.removeEventListener("load", scriptLoaded, false);
            cb && cb();
        }
        const domScript = document.createElement("script");
        domScript.async = true;
        domScript.src = moduleName;
        domScript.addEventListener("load", scriptLoaded, false);
        document.body.appendChild(domScript);
    }

    loadScript(debug ? "cocos2d-js.js" : "cocos2d-js-min.js", function () {
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            loadScript(debug ? "physics.js" : "physics-min.js", window.boot);
        } else {
            window.boot();
        }
    });
}

function initGA() {
    const gaCode = window.envConfig.systemType === "SC1" ? "G-GJDD3FENTH" : "G-JHKMX35LM3";

    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaCode}`).then(
        () => {
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", gaCode);
        },
        (reason) => {
            console.log("Init GA failed with" + reason);
        }
    );
}

function addGATrackingButton() {
    if (window.envConfig.sentry.env !== "PRO") {
        return;
    }
    const gaCode = "G-W13X2FGNGN";
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaCode}`).then(
        () => {
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", gaCode);
            window.gtag = gtag;
        },
        (reason) => {
            console.log("Init GA failed with" + reason);
        }
    );
}

function loadScript(src) {
    return new Promise(function (resolve, reject) {
        let script;
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function getLanguageURLparams(locale) {
    const dict = {
        "vi-VN": "vi",
        "en-US": "en",
        "en-UK": "en",
        "th-TH": "th",
        "id-ID": "id",
        "zh-CN": "zh_cn",
        "zh-TW": "zh_tw"
    };
    return dict[locale] || "en";
}

function getCurrentLanguage() {
    let language = "vi";
    try {
        if (localStorage.getItem("current_language")) {
            language = localStorage.getItem("current_language");
        }
    } catch (e) {}
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("lang")) {
        const lang = urlParams.get("lang");
        language = getLanguageURLparams(lang);
    }
    return language;
}

function updateLocalizedImages() {
    const language = getCurrentLanguage();

    let title = "Default Title";
    let favicon = "favicon.ico";
    setTitleAndFavicon(title, favicon);
    setSplashTextClass(language);
}

function setTitleAndFavicon(title, favicon) {
    document.title = title;
    const rel = document.getElementById("favicon");
    rel.href = favicon;
}

function setSplashTextClass(language) {
    const splashText = document.getElementById("splash_text");
    const className = `splash_text_${language}`;
    splashText.className += ` ${className}`;
}

class RandomWaitingMessage {
    constructor() {
        const waitingMessage = document.getElementById("waiting-message");
        waitingMessage.classList.add("waiting-message");
        // Messages are currently empty, so we'll keep the class but not show any messages
        this.intervalId = null;
    }

    clearInterval() {
        this.intervalId && clearInterval(this.intervalId);
        this.intervalId = null;
    }
}

updateLocalizedImages();
window.randomWaitingMessage = new RandomWaitingMessage();
initGameEngine();
initGA();
addGATrackingButton();

const waitingMessages = {
    en: ["If this is your first visit, downloading may take a while", "Checking and downloading the latest update packages..."],
    vi: ["Lần truy cập đầu tiên, việc tải dữ liệu sẽ mất chút thời gian.", "Đang kiểm tra và tải gói cập nhật game mới nhất..."],
    id: [
        "Jika ini adalah kunjungan pertama Anda, pengunduhan mungkin memakan waktu cukup lama.",
        "Memeriksa dan mengunduh paket pembaruan terbaru..."
    ],
    th: ["หากคุณเข้าชมครั้งแรก อาจใช้เวลาในการดาวน์โหลดสักครู่", "กำลังตรวจสอบและกำลังดาวน์โหลดเกมของการอัพเดทล่าสุด"],
    zh_cn: ["如果这是您第一次访问，下载可能需要一段时间。", "正在检查和下载最新的更新包..."],
    zh_tw: ["如果這是您第一次訪問，下載可能需要一段時間。", "正在檢查和下載最新的更新包..."]
};

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

function getOperator() {
    let operator = "";
    try {
        if (localStorage.getItem("current_operator")) {
            operator = localStorage.getItem("current_operator");
        }
    } catch (e) {}
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("op")) {
        operator = urlParams.get("op");
    }
    return operator;
}

function updateLocalizedImages() {
    const language = getCurrentLanguage();
    const operator = getOperator()?.toUpperCase();

    const OperatorAlias = {
        SP: "SP",
        VG: "VG",
        SG: "SG",
        TIP88: "TIP88"
    };

    let title, favicon;
    switch (OperatorAlias[operator]) {
        case OperatorAlias.SP:
            title = "Saba Play";
            favicon = "favicon_sabaplay.ico?v=5";
            break;
        case OperatorAlias.VG:
            title = "Vgaming";
            favicon = "favicon_vgaming.ico?v=4";
            break;
        case OperatorAlias.SG:
            title = language === "vi" ? "Cổng Game SABA" : "SABA.games";
            favicon = "favicon.ico?v=4";
            break;
        case OperatorAlias.TIP88:
            title = "Tip88";
            favicon = "favicon_tip88.ico?v=4";
            break;
        default:
            title = "Default Title";
            favicon = "default_favicon.ico";
            break;
    }

    setTitleAndFavicon(title, favicon);
    setSplashTextClass(language);
    updatePoweredBy(language);
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

function updateSplashLogo() {
    const operator = getOperator().toUpperCase();
    const splash_logo = document.getElementById("splash_logo");
    if (splash_logo) {
        const suffix = getCSSClassName(operator);
        splash_logo.className = `splash${suffix}`;
    }
}

function updatePoweredBy(language) {
    const operator = getOperator().toUpperCase();
    const poweredBy = document.getElementById("powered-by");
    if (poweredBy) {
        const suffix = getCSSClassName(operator);
        poweredBy.className = `powered-by${suffix} ${language}`;
    }
}

function getCSSClassName(operator) {
    const operators = {
        TIP88: "_tip88",
        SP: "_sabaplay",
        VG: "_Vgaming",
        SG: ""
    };

    if (operators.hasOwnProperty(operator)) {
        return operators[operator];
    } else {
        return window.envConfig.systemType === "SC2" ? "_other_sc2" : "_other_sc1";
    }
}

class RandomWaitingMessage {
    constructor() {
        const language = getCurrentLanguage().replace(/['"]+/g, "");
        this.intervalId = null;
        const waitingMessage = document.getElementById("waiting-message");
        waitingMessage.classList.add("waiting-message");
        const messages = waitingMessages[language] || waitingMessages.en;
        let currentIndex = 0;

        const showMessage = () => {
            waitingMessage.style.transition = "none";
            waitingMessage.classList.remove("show", "fade-out");
            waitingMessage.offsetHeight;
            waitingMessage.style.transition = "all 1s ease";
            waitingMessage.textContent = messages[currentIndex];
            requestAnimationFrame(() => {
                waitingMessage.classList.add("show");
                setTimeout(() => {
                    waitingMessage.classList.remove("show");
                    waitingMessage.classList.add("fade-out");
                }, 4000);
            });
        };

        this.intervalId && clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % messages.length;
            showMessage();
        }, 5000);

        showMessage();
    }

    clearInterval() {
        this.intervalId && clearInterval(this.intervalId);
        this.intervalId = null;
    }
}

updateSplashLogo();
updateLocalizedImages();
window.randomWaitingMessage = new RandomWaitingMessage();
initGameEngine();
initGA();
addGATrackingButton();

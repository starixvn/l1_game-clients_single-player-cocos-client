import * as configs from "../configs/Configs";

console.log("[Logger] Loading logger module...");

export const sentryLogger = {
    sentryUrl: null,
    loaded: false,
    ignoreErrorsPrefix: "SENTRY IGNORE ERRORS:",
    isEnabled: () => {
        const enabled = sentryLogger.sentryUrl != null && document && document.head;
        console.log("🔍 [Logger] Sentry enabled check:", enabled, "sentryUrl:", sentryLogger.sentryUrl);
        return enabled;
    },
    loadScript: () => {
        console.log("🔍 [Logger] Loading Sentry script, loaded:", sentryLogger.loaded);
        if (window.Sentry && !sentryLogger.loaded) {
            console.log("🔍 [Logger] Initializing Sentry with config");
            window.Sentry.init({
                dsn: configs.sentry.url,
                environment: configs.sentry.env,
                maxValueLength: 5000,
                ignoreErrors: [
                    "fullscreen error",
                    "exitFullscreen",
                    "start the audio device",
                    "zaloJSV2",
                    "socket disconnect",
                    "UnhandledRejectionhttps",
                    "cocos2d-js-min",
                    "cocos-creator",
                    "timeout",
                    "WebGLRenderingContext",
                    "websocket error",
                    "undefined is not an object (evaluating 'cc.RedT.user')",
                    /^.*Cannot read properties.*(?:user|setAvatar|onSet|setLoadingVisibility).*$/gm,
                    /^.*not an object.*(?:openGame|openNewSocket|gameName|language|this.percent|this.pagination|remoteBundle).*$/gm,
                    /^.*Node is not valid!.*$/gm,
                    /^.*SENTRY IGNORE ERRORS:*$/gm
                ]
            });
            sentryLogger.loaded = true;
            console.log("🔍 [Logger] Sentry initialized successfully");
        } else {
            console.log("🔍 [Logger] Sentry already loaded or not available");
        }
    },
    start: () => {
        console.log("🔍 [Logger] Starting Sentry logger");
        try {
            sentryLogger.sentryUrl = configs.sentry.url;
            console.log("🔍 [Logger] Sentry URL set:", sentryLogger.sentryUrl);

            if (sentryLogger.isEnabled() && document.head && !document.getElementById("sentry-logger")) {
                console.log("🔍 [Logger] Creating Sentry script element");
                const sentryScript = document.createElement("script");

                sentryScript.setAttribute("id", "sentry-logger");
                sentryScript.setAttribute("src", "https://browser.sentry-cdn.com/5.15.0/bundle.min.js");
                sentryScript.setAttribute("integrity", "sha384-+ysfQckQvwCB5SppH41IScIz/Iynt2pePnJNMl+D7ZOzDJ+VYhQEuwB0pA60IDM0");
                sentryScript.setAttribute("crossorigin", "anonymous");
                sentryScript.onload = () => {
                    console.log("🔍 [Logger] Sentry script loaded successfully");
                    sentryLogger.loadScript();
                };

                document.head.appendChild(sentryScript);
                console.log("🔍 [Logger] Sentry script appended to document head");
            } else {
                console.log("🔍 [Logger] Sentry script already exists or conditions not met");
            }
        } catch (ex) {
            console.error("🔍 [Logger] Error starting Sentry:", ex);
            console.log(ex);
        }
    },

    log: (message) => {
        console.log("🔍 [Logger] Logging message to Sentry:", message);
        if (sentryLogger.isEnabled()) {
            sentryLogger.loadScript();
            if (window.Sentry) {
                window.Sentry.captureMessage(message);
                console.log("🔍 [Logger] Message sent to Sentry successfully");
            } else {
                console.warn("🔍 [Logger] Sentry not available for message logging");
            }
        } else {
            console.log("🔍 [Logger] Sentry not enabled, skipping message log");
        }
    },

    logError: (exception) => {
        console.error("🔍 [Logger] Logging error to Sentry:", exception);
        if (sentryLogger.isEnabled()) {
            sentryLogger.loadScript();
            if (window.Sentry) {
                window.Sentry.captureException(exception);
                console.log("🔍 [Logger] Error sent to Sentry successfully");
            } else {
                console.warn("🔍 [Logger] Sentry not available for error logging");
            }
        } else {
            console.log("🔍 [Logger] Sentry not enabled, skipping error log");
        }
    },

    setUser: (user) => {
        console.log("🔍 [Logger] Setting user in Sentry:", user);
        if (sentryLogger.isEnabled() && user) {
            const setUserInfo = () => {
                try {
                    if (window.Sentry) {
                        window.Sentry.configureScope(function (scope) {
                            scope.setUser(user);
                        });
                        console.log("🔍 [Logger] User set in Sentry successfully");
                    } else {
                        console.log("🔍 [Logger] Sentry not available, retrying in 1 second");
                        setTimeout(setUserInfo, 1000);
                    }
                } catch (ex) {
                    console.error("🔍 [Logger] Error setting user in Sentry:", ex);
                    console.log(ex);
                }
            };

            setUserInfo();
        } else {
            console.log("🔍 [Logger] Cannot set user - Sentry not enabled or no user data");
        }
    },

    setTag: (tag) => {
        console.log("🔍 [Logger] Setting tag in Sentry:", tag);
        if (sentryLogger.isEnabled() && tag) {
            try {
                if (window.Sentry) {
                    window.Sentry.configureScope(function (scope) {
                        scope.setTag(tag.id, tag.value);
                    });
                    console.log("🔍 [Logger] Tag set in Sentry successfully:", tag.id, tag.value);
                } else {
                    console.warn("🔍 [Logger] Sentry not available for tag setting");
                }
            } catch (ex) {
                console.error("🔍 [Logger] Error setting tag in Sentry:", ex);
                console.log(ex);
            }
        } else {
            console.log("🔍 [Logger] Cannot set tag - Sentry not enabled or no tag data");
        }
    },

    setCharacterName: (name) => {
        console.log("🔍 [Logger] Setting character name:", name);
        sentryLogger.setTag({ id: "character-name", value: name });
    },

    setSocketIoId: (socketId) => {
        console.log("🔍 [Logger] Setting socket IO ID:", socketId);
        sentryLogger.setTag({ id: "socket-io-id", value: socketId });
    }
};

export default function () {
    console.log("[Logger] Creating logger instance");
    return sentryLogger;
}

console.log("[Logger] Logger module loaded successfully");

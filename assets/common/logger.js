import * as configs from "../configs/Configs";



export const sentryLogger = {
    sentryUrl: null,
    loaded: false,
    ignoreErrorsPrefix: "SENTRY IGNORE ERRORS:",
    isEnabled: () => {
        const enabled = sentryLogger.sentryUrl != null && document && document.head;
        
        return enabled;
    },
    loadScript: () => {
        
        if (window.Sentry && !sentryLogger.loaded) {
            
            window.Sentry.init({
                dsn: configs.sentry.url,
                environment: configs.sentry.env,
                maxValueLength: 5000,
                tracesSampleRate: 1.0,
                integrations: [new window.Sentry.BrowserTracing()],
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
            
        } else {
            
        }
    },
    start: () => {
        
        try {
            sentryLogger.sentryUrl = configs.sentry.url;
            

            if (sentryLogger.isEnabled() && document.head && !document.getElementById("sentry-logger")) {
                
                const sentryScript = document.createElement("script");

                sentryScript.setAttribute("id", "sentry-logger");
                sentryScript.setAttribute("src", "https://browser.sentry-cdn.com/7.95.0/bundle.tracing.min.js");
                sentryScript.setAttribute("crossorigin", "anonymous");
                sentryScript.onload = () => {
                    
                    sentryLogger.loadScript();
                };

                document.head.appendChild(sentryScript);
                
            } else {
                
            }
        } catch (ex) {
            console.error("🔍 [Logger] Error starting Sentry:", ex);
            
        }
    },

    log: (message) => {
        
        if (sentryLogger.isEnabled()) {
            sentryLogger.loadScript();
            if (window.Sentry) {
                window.Sentry.captureMessage(message);
                
            } else {
                console.warn("🔍 [Logger] Sentry not available for message logging");
            }
        } else {
            
        }
    },

    logError: (exception) => {
        console.error("🔍 [Logger] Logging error to Sentry:", exception);
        if (sentryLogger.isEnabled()) {
            sentryLogger.loadScript();
            if (window.Sentry) {
                window.Sentry.captureException(exception);
                
            } else {
                console.warn("🔍 [Logger] Sentry not available for error logging");
            }
        } else {
            
        }
    },

    setUser: (user) => {
        
        if (sentryLogger.isEnabled() && user) {
            const setUserInfo = () => {
                try {
                    if (window.Sentry) {
                        window.Sentry.configureScope(function (scope) {
                            scope.setUser(user);
                        });
                        
                    } else {
                        
                        setTimeout(setUserInfo, 1000);
                    }
                } catch (ex) {
                    console.error("🔍 [Logger] Error setting user in Sentry:", ex);
                    
                }
            };

            setUserInfo();
        } else {
            
        }
    },

    setTag: (tag) => {
        
        if (sentryLogger.isEnabled() && tag) {
            try {
                if (window.Sentry) {
                    window.Sentry.configureScope(function (scope) {
                        scope.setTag(tag.id, tag.value);
                    });
                    
                } else {
                    console.warn("🔍 [Logger] Sentry not available for tag setting");
                }
            } catch (ex) {
                console.error("🔍 [Logger] Error setting tag in Sentry:", ex);
                
            }
        } else {
            
        }
    },

    setCharacterName: (name) => {
        
        sentryLogger.setTag({ id: "character-name", value: name });
    },

    setSocketIoId: (socketId) => {
        
        sentryLogger.setTag({ id: "socket-io-id", value: socketId });
    }
};

export default function () {
    
    return sentryLogger;
}



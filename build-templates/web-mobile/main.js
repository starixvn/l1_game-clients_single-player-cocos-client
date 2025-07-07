window.boot = function () {
    var settings = window._CCSettings;
    window._CCSettings = undefined;
    var onProgress = null;

    // cc.macro.ENABLE_WEBGL_ANTIALIAS = true;

    const isIOS14Device =
        cc.sys.os === cc.sys.OS_IOS && cc.sys.isBrowser && cc.sys.isMobile && /iPhone OS 14/.test(window.navigator.userAgent);
    if (isIOS14Device) {
        cc.MeshBuffer.prototype.checkAndSwitchBuffer = function (vertexCount) {
            if (this.vertexOffset + vertexCount > 65535) {
                this.uploadData();
                this._batcher._flush();
            }
        };
        cc.MeshBuffer.prototype.forwardIndiceStartToOffset = function () {
            this.uploadData();
            this.switchBuffer();
        };
    }

    if (cc.sys.isBrowser && (cc.sys.os === cc.sys.OS_IOS || cc.sys.os === cc.sys.OS_OSX)) {
        function checkSupport(cb) {
            var webP = new Image();
            webP.onload = webP.onerror = function () {
                let isSupported = webP.height === 2;
                cb(isSupported);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }

        checkSupport(function (result) {
            cc.sys.capabilities.webp = result; // overwrite
        });
    }

    if (cc.sys.os === cc.sys.OS_IOS) {
        var __BrowserGetter = {
            init: function () {
                this.html = document.getElementsByTagName("html")[0];
            },
            availWidth: function (frame) {
                if (!frame || frame === this.html) {
                    return window.innerWidth;
                } else {
                    return frame.clientWidth;
                }
            },
            availHeight: function (frame) {
                if (!frame || frame === this.html) {
                    return window.innerHeight;
                } else {
                    return frame.clientHeight;
                }
            },
            meta: {
                width: "device-width"
            },
            adaptationType: cc.sys.browserType
        };

        if (cc.sys.os === cc.sys.OS_IOS) {
            // All browsers are WebView
            __BrowserGetter.adaptationType = cc.sys.BROWSER_TYPE_SAFARI;
        }

        switch (__BrowserGetter.adaptationType) {
            case cc.sys.BROWSER_TYPE_SAFARI:
            case cc.sys.BROWSER_TYPE_SOUGOU:
            case cc.sys.BROWSER_TYPE_UC:
                __BrowserGetter.meta["minimal-ui"] = "true";
                __BrowserGetter.availWidth = function (frame) {
                    return frame.clientWidth;
                };
                __BrowserGetter.availHeight = function (frame) {
                    return frame.clientHeight;
                };
                break;
        }

        // fix canvas display wrong scale
        cc.view._initFrameSize = function () {
            var locFrameSize = this._frameSize;
            var w = __BrowserGetter.availWidth(cc.game.frame);
            var h = __BrowserGetter.availHeight(cc.game.frame);
            var isLandscape = w >= h;

            //CHEAT: force height equal screen.width
            const userAgent = window.navigator.userAgent;
            if (isLandscape) {
                h = window.innerHeight;
            }

            if (
                CC_EDITOR ||
                !cc.sys.isMobile ||
                (isLandscape && this._orientation & cc.macro.ORIENTATION_LANDSCAPE) ||
                (!isLandscape && this._orientation & cc.macro.ORIENTATION_PORTRAIT)
            ) {
                locFrameSize.width = w;
                locFrameSize.height = h;
                cc.game.container.style["-webkit-transform"] = "rotate(0deg)";
                cc.game.container.style.transform = "rotate(0deg)";
                this._isRotated = false;
            } else {
                locFrameSize.width = h;
                locFrameSize.height = w;
                cc.game.container.style["-webkit-transform"] = "rotate(90deg)";
                cc.game.container.style.transform = "rotate(90deg)";
                cc.game.container.style["-webkit-transform-origin"] = "0px 0px 0px";
                cc.game.container.style.transformOrigin = "0px 0px 0px";
                this._isRotated = true;
            }
            if (this._orientationChanging) {
                setTimeout(function () {
                    cc.view._orientationChanging = false;
                }, 1000);
            }
        };

        cc.view.convertToLocationInView = function (tx, ty, relatedPos, out) {
            let result = out || cc.v2();
            let posLeft = relatedPos.adjustedLeft ? relatedPos.adjustedLeft : relatedPos.left;
            let posTop = relatedPos.top; //relatedPos.adjustedTop ? relatedPos.adjustedTop : relatedPos.top;
            let x = this._devicePixelRatio * (tx - posLeft);
            let y = this._devicePixelRatio * (posTop + relatedPos.height - ty);
            if (this._isRotated) {
                result.x = cc.game.canvas.width - y;
                result.y = x;
            } else {
                result.x = x;
                result.y = y;
            }
            return result;
        };

        cc.internal.inputManager._updateCanvasBoundingRect = function () {
            var element = cc.game.canvas;
            var canvasBoundingRect = this._canvasBoundingRect;
            var docElem = document.documentElement;
            var leftOffset = window.pageXOffset - docElem.clientLeft;
            var topOffset = 0; // window.pageYOffset - docElem.clientTop;

            if (element.getBoundingClientRect) {
                var box = element.getBoundingClientRect();
                canvasBoundingRect.left = box.left + leftOffset;
                canvasBoundingRect.top = 0; //box.top + topOffset;
                canvasBoundingRect.width = box.width;
                canvasBoundingRect.height = box.height;
            } else if (element instanceof HTMLCanvasElement) {
                canvasBoundingRect.left = leftOffset;
                canvasBoundingRect.top = topOffset;
                canvasBoundingRect.width = element.width;
                canvasBoundingRect.height = element.height;
            } else {
                canvasBoundingRect.left = leftOffset;
                canvasBoundingRect.top = topOffset;
                canvasBoundingRect.width = parseInt(element.style.width);
                canvasBoundingRect.height = parseInt(element.style.height);
            }
        };
    }

    const { RESOURCES, INTERNAL, MAIN, START_SCENE } = cc.AssetManager.BuiltinBundleName;
    function setLoadingDisplay() {
        // Loading splash scene
        const splash = document.getElementById("splash");
        // var progressBar = splash.querySelector(".progress-bar span");
        var loadingBar = new ldBar(".ldBar");
        onProgress = function (completedCount, totalCount, item) {
            var percent = (100 * completedCount) / totalCount;
            loadingBar.set(percent);
            // if (progressBar) {
            //     progressBar.style.width = percent.toFixed(2) + '%';
            // }
        };
        splash.style.display = "block";
        // progressBar.style.width = "0%";

        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            splash.style.display = "block";
            const gameContainer = document.getElementById("Cocos2dGameContainer");
            if (gameContainer) {
                gameContainer.style.top = window.scrollY + "px";
            }
            document.body.style.backgroundColor = "transparent";
            splash.style.transition = "opacity 0.2s ease-in-out";
            splash.style.opacity = 0;
            const progressBar = document.getElementById("loading_icon");
            progressBar.style.display = "none";
            const waitingMessage = document.getElementById("waiting-message");
            waitingMessage.style.display = "none";
            window.randomWaitingMessage?.clearInterval();

            setTimeout(() => {
                splash.style.display = "none";
            }, 200);
        });
    }

    var onStart = function () {
        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isBrowser) {
            setLoadingDisplay();
        }

        if (cc.sys.isMobile) {
            if (settings.orientation === "landscape") {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            } else if (settings.orientation === "portrait") {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
            // cc.view.enableAutoFullScreen(
            //     [
            //         cc.sys.BROWSER_TYPE_BAIDU,
            //         cc.sys.BROWSER_TYPE_BAIDU_APP,
            //         cc.sys.BROWSER_TYPE_WECHAT,
            //         cc.sys.BROWSER_TYPE_MOBILE_QQ,
            //         cc.sys.BROWSER_TYPE_MIUI
            //     ].indexOf(cc.sys.browserType) < 0
            // );

            cc.view.enableAutoFullScreen(false);
        }

        // Limit downloading max concurrent task to 2,
        // more tasks simultaneously may cause performance draw back on some android system / browsers.
        // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
            cc.assetManager.downloader.maxRequestsPerFrame = 2;
        }

        var launchScene = settings.launchScene;
        var bundle = cc.assetManager.bundles.find(function (b) {
            return b.getSceneInfo(launchScene);
        });

        bundle.loadScene(launchScene, null, onProgress, function (err, scene) {
            if (!err) {
                cc.director.runSceneImmediate(scene);
                if (cc.sys.isBrowser) {
                    // show canvas
                    var canvas = document.getElementById("GameCanvas");
                    canvas.style.visibility = "";
                    var div = document.getElementById("GameDiv");
                    if (div) {
                        div.style.backgroundImage = "";
                    }
                    console.log("Success to load scene: " + launchScene);
                }
            }
        });
    };

    var option = {
        id: "GameCanvas",
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix
    };

    cc.assetManager.init({
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server
    });

    const bundleRoot = [INTERNAL, MAIN];
    settings.hasStartSceneBundle && bundleRoot.push(START_SCENE);
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

    var count = 0;
    function cb(err) {
        if (err) {
            return console.error(err.message, err.stack);
        }
        count++;
        if (count === bundleRoot.length + 1) {
            cc.macro.ENABLE_TRANSPARENT_CANVAS = true;
            cc.game.run(option, onStart);
        }
    }

    cc.assetManager.loadScript(
        settings.jsList.map(function (x) {
            return "src/" + x;
        }),
        cb
    );

    for (let i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle(bundleRoot[i], cb);
    }
};

if (window.jsb) {
    var isRuntime = typeof loadRuntime === "function";
    if (isRuntime) {
        require("src/settings.js");
        require("src/cocos2d-runtime.js");
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require("src/physics.js");
        }
        require("jsb-adapter/engine/index.js");
    } else {
        require("src/settings.js");
        require("src/cocos2d-jsb.js");
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require("src/physics.js");
        }
        require("jsb-adapter/jsb-engine.js");
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
}

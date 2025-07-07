function initGA() {
    const gaCode = "G-W13X2FGNGN";
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaCode}`).then(
        () => {
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", gaCode, { debug_mode: true });
            window.gtag = gtag;
        },
        (reason) => {
            console.log("Init GA failed with" + reason);
        }
    );

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
}

(function () {
    "use strict";

    var canvas = document.getElementById("GameCanvas");
    window.onload = function () {
        if (window.__quick_compile_engine__) {
            window.__quick_compile_engine__.load(onload);
        } else {
            onload();
        }
    };

    function onload() {
        // socket
        // =======================

        // Receives a refresh event from the editor, which triggers the reload of the page
        var socket = window.io();
        socket.on("browser:reload", function () {
            window.location.reload();
        });
        socket.on("browser:confirm-reload", function () {
            var r = confirm("Reload?");
            if (r) {
                window.location.reload();
            }
        });

        // init engine
        // =======================

        var engineInited = false;

        var onStart = function () {
            cc.view.enableRetina(true);
            cc.view.resizeWithBrowserSize(true);

            if (cc.sys.isBrowser && (cc.sys.os === cc.sys.OS_IOS || cc.sys.os === cc.sys.OS_OSX)) {
                function checkSupport(cb) {
                    var webP = new Image();
                    webP.onload = webP.onerror = function () {
                        let isSupported = webP.height === 2;
                        cb(isSupported);
                    };
                    webP.src =
                        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
                }

                checkSupport(function (result) {
                    cc.sys.capabilities.webp = result; // overwrite
                });
            }

            // Loading splash scene
            var splash = document.getElementById("splash");
            var progressBar = splash.querySelector(".progress-bar span");

            cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
                splash.style.display = "none";
            });

            cc.game.pause();

            // init assets
            engineInited = true;

            cc.assetManager.loadAny(
                { url: "preview-scene.json", __isNative__: false },
                null,
                function (finish, totalCount) {
                    var percent = (100 * finish) / totalCount;
                    if (progressBar) {
                        progressBar.style.width = percent.toFixed(2) + "%";
                    }
                },
                function (err, sceneAsset) {
                    if (err) {
                        console.error(err.message, err.stack);
                        return;
                    }
                    var scene = sceneAsset.scene;
                    scene._name = sceneAsset._name;
                    cc.assetManager.dependUtil._depends.add(scene._id, cc.assetManager.dependUtil._depends.get("preview-scene.json"));
                    cc.director.runSceneImmediate(scene, function () {
                        // play game
                        cc.game.resume();
                    });
                }
            );

            // purge
            //noinspection JSUnresolvedVariable
            _CCSettings = undefined;
        };

        var option = {
            id: canvas,
            debugMode: _CCSettings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
            showFPS: _CCSettings.debug,
            frameRate: 60,
            groupList: _CCSettings.groupList,
            collisionMatrix: _CCSettings.collisionMatrix
        };

        cc.assetManager.init({
            importBase: "assets/others/import",
            nativeBase: "assets/others/native"
        });

        let { RESOURCES, INTERNAL, MAIN } = cc.AssetManager.BuiltinBundleName;
        var bundleRoot = [INTERNAL];
        _CCSettings.hasResourcesBundle && bundleRoot.push(RESOURCES);

        var count = 0;
        function cb(err) {
            if (err) return console.error(err);
            count++;
            if (count === bundleRoot.length + 1) {
                cc.assetManager.loadBundle(MAIN, function (err) {
                    if (!err) cc.game.run(option, onStart);
                });
            }
        }

        // load plugins
        cc.assetManager.loadScript(
            _CCSettings.jsList.map(function (x) {
                return "/plugins/" + x;
            }),
            cb
        );

        // load bundles
        for (let i = 0; i < bundleRoot.length; i++) {
            cc.assetManager.loadBundle("assets/" + bundleRoot[i], cb);
        }
    }
})();
initGA();

var BundleManager = require("bundle-management").BundleManager;
cc.Class({
    extends: cc.Component,
    editor: {
        menu: "Bundle Management/Remote Prefab Loader",
    },
    properties: {
        bundleId: "",
        prefabPath: "",
        initializationEventHandlers: {
            default: [],
            type: cc.Component.EventHandler,
        },
        onProgressHandlers: {
            default: [],
            type: cc.Component.EventHandler,
        },
    },
    onLoad: function () {
        var _this = this;
        return BundleManager.getInstance()
            .loadAsset({
            bundleId: this.bundleId,
            path: this.prefabPath,
            type: cc.Prefab,
            onProgress: function (finished, total) { return _this._onProgress(finished, total); },
        })
            .then(function (prefab) {
            var node = cc.instantiate(prefab);
            _this._onInitialize(node);
        })
            .catch(function (error) {
            cc.error(error);
        });
    },
    _onInitialize: function (node) {
        if (CC_EDITOR) {
            // Without running in development mode
            return;
        }
        this.node.addChild(node);
        this.initializationEventHandlers.forEach(function (event) { return event.emit([node]); });
    },
    _onProgress: function (finished, total) {
        this.onProgressHandlers.forEach(function (event) { return event.emit([finished, total]); });
    },
});

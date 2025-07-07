import i18n from "i18n/runtime-scripts/LanguageData";

import AudioManager from "../../../common/audio/AudioManager";
import UserService from "../../../common/auth/UserService";
import { appManager } from "../../../managers/AppManager";

var BrowserUtil = require("BrowserUtil");
const NameGenerator = require("../../../common/name-generator/NameGenerator");
const InvalidUserNameKey = "ui.name_invalid";

cc.Class({
    extends: cc.Component,

    properties: {
        username: {
            default: null,
            type: cc.EditBox
        },
        errorMessage: {
            default: null,
            type: cc.Label
        },
        dialogNode: cc.Node
    },
    init(onSuccessFunc) {
        this.onSuccessFunc = onSuccessFunc;
    },
    onLoad() {
        window.skipFullscreen = true;
        this.keyHandle = (t) => {
            if (t.keyCode === cc.macro.KEY.tab) {
                this.changeNextFocusEditBox();
                if (t.preventDefault && t.preventDefault()) {
                    return false;
                }
                return undefined;
            } else if (t.keyCode === cc.macro.KEY.enter) {
                BrowserUtil.focusGame();
                this.onSignNameClick();
                if (t.preventDefault && t.preventDefault()) {
                    return false;
                }
                return undefined;
            }

            return undefined;
        };

        const commonDialog = this.dialogNode.getComponent("CommonDialog");
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    },
    onDestroy() {
        window.skipFullscreen = false;
    },
    onEnable: function () {
        cc.sys.isBrowser && this.addEvent();
        this.generateName();
    },
    onDisable: function () {
        cc.sys.isBrowser && this.removeEvent();
        this.clean();
    },
    onEditClick: function () {
        AudioManager.getInstance().playClick();
        this.username.focus();
    },
    onGenerateNameClick: function () {
        AudioManager.getInstance().playClick();
        this.generateName();
    },
    generateName: function () {
        this.username.string = NameGenerator.default.generateName();
        this.usernameTextChanged();
    },
    addEvent: function () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        BrowserUtil.getHTMLElementByEditBox(this.username).addEventListener("keydown", this.keyHandle, !1);
        this.username.node.on("text-changed", this.usernameTextChanged, this);
    },
    removeEvent: function () {
        BrowserUtil.getHTMLElementByEditBox(this.username).removeEventListener("keydown", this.keyHandle, !1);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.username.node.off("text-changed", this.usernameTextChanged, this);
    },
    onKeyDown: function (event) {
        switch (event.keyCode) {
            case cc.macro.KEY.tab:
                this.isTop() && this.changeNextFocusEditBox();
                break;
            case cc.macro.KEY.enter:
                this.isTop() && this.onSignNameClick();
        }
    },
    changeNextFocusEditBox: function () {
        BrowserUtil.focusEditBox(this.username);
    },
    isTop: function () {
        return !appManager.currentScene.notice.node.active && !appManager.currentScene.loading.active;
    },
    clean: function () {
        this.username.string = "";
    },
    onSignNameClick: function () {
        if (this.validateUsername(this.username.string)) {
            this.errorMessage.string = i18n.t(InvalidUserNameKey);
        } else {
            const authData = window.authData;
            UserService.getInstance().auth.signName(authData.ss, authData.username, this.username.string).then(this.onSuccessFunc);
        }
    },

    usernameTextChanged: function () {
        if (this.validateUsername(this.username.string)) {
            this.errorMessage.string = i18n.t(InvalidUserNameKey);
        } else {
            this.errorMessage.string = "";
        }
    },

    validateUsername: function (username) {
        const regex = new RegExp("^[a-zA-Z0-9]+$");
        return username.length > 14 || username.length < 3 || username.match(regex) === null;
    },
    onEditBoxFocus: function () {
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
        this._debounceTimer = setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 200);
    }
});

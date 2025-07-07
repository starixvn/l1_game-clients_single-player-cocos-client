import { AppTypes } from "../../../common/auth/AuthManager";
import GameUtils from "../../../common/GameUtils";
import configs = require("../../../configs/Configs");

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonsLobby extends cc.Component {
    @property(cc.Node)
    downloadApp: cc.Node = null;

    @property(cc.Node)
    settingMenu: cc.Node = null;

    protected onLoad(): void {
        if (GameUtils.isAndroid()) {
            this.downloadApp.active = configs.AppDownloadSubDomain && window.authData?.system !== AppTypes.SabaApp;
        } else {
            this.downloadApp.active = false;
        }
    }

    initClickEven(node: cc.Node, targetNode: cc.Node, component: string, handler: string) {
        const button = node.getComponent(cc.Button);
        const event = new cc.Component.EventHandler();
        event.target = targetNode;
        event.component = component;
        event.handler = handler;

        button.clickEvents.push(event);
    }
}

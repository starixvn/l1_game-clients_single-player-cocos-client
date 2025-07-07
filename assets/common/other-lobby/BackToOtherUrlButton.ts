import { appManager } from "../../managers/AppManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BackToOtherUrlButton extends cc.Component {
    onClick() {
        appManager.backToOperatorLobby();
    }
}

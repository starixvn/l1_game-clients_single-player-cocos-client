import { appManager } from "../../managers/AppManager";
import { UrlInfo } from "../../managers/UrlInfo";

const { ccclass, property } = cc._decorator;

export enum NodeType {
    Lobby = 0,
    Back = 1
}

@ccclass
export default class DirectModeVisibility extends cc.Component {
    @property({ type: cc.Enum(NodeType) })
    type: NodeType = NodeType.Lobby;

    onEnable() {
        this.node.active = this.getVisibility(this.type);
    }

    private getVisibility(type: NodeType): boolean {
        let visible = false;
        switch (type) {
            case NodeType.Lobby:
                visible = !!appManager.urlInfo[UrlInfo.ReturnUrl];
                break;
            case NodeType.Back:
                visible = !!appManager.urlInfo[UrlInfo.ReturnUrl];
                break;
        }

        return visible;
    }
}

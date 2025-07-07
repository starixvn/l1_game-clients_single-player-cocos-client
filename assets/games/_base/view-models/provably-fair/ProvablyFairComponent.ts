import GameUtils from "../../../../common/GameUtils";
import ProvablyFairComponentBase from "./ProvablyFairComponentBase";

const { ccclass, property } = cc._decorator;

export type ProvablyFairType = {
    hashValue: string;
    clientSeed?: number;
};

@ccclass
export default class ProvablyFairComponent extends ProvablyFairComponentBase {
    @property(cc.Label)
    lblClientSeed: cc.Label = null;

    @property(cc.Label)
    lblServerSeed: cc.Label = null;

    @property(cc.Prefab)
    clientSeedManualPrefab: cc.Prefab = null;

    @property()
    delayShowServerSeed = 0;

    protected serverSeedCopyString = "";
    protected timeout: NodeJS.Timeout;
    protected currentServerSeed = "";

    public nextServerSeed = "";
    public currentClientSeed = 0;

    public isShowPFSettings = false;

    handleReceiveServerSeed(data: ProvablyFairType) {
        if (!this.currentServerSeed.length) {
            this.currentServerSeed = data?.hashValue;
            this.handleServerSeed(data?.hashValue);
            return;
        }

        this.nextServerSeed = data?.hashValue;
    }

    handleServerSeed(hashValue: string) {
        if (!this.node.activeInHierarchy) {
            this.handleProvablyFairData(hashValue);
            return;
        }

        this.timeout = setTimeout(() => {
            this.handleProvablyFairData(hashValue);
        }, this.delayShowServerSeed * 1000);
    }

    protected handleProvablyFairData(hashValue: string) {
        if (this.node?.isValid) {
            this.lblServerSeed.string = hashValue;
            this.setCopyString(hashValue);
        }
    }

    updateStatusPFSettingsPopup(status: boolean) {
        this.isShowPFSettings = status;
    }

    updateClientSeed(value: string) {
        this.currentClientSeed = +value;
        this.setClientSeed();
    }

    protected resetProvablyFair() {
        this.lblServerSeed.string = "";
        this.setCopyString("");
        this.timeout && clearTimeout(this.timeout);
    }

    protected setCopyString(text: string) {
        this.serverSeedCopyString = text;
    }

    protected setClientSeed() {
        this.lblClientSeed.string = this.currentClientSeed.toString();
    }

    protected changeOpacity(node: cc.Node, isEnable: boolean) {
        node.opacity = isEnable ? 255 : 100;
    }

    onClientSeedClick() {
        // handle
    }

    onCopyHash() {
        GameUtils.copyToClipboard(this.serverSeedCopyString, this.getHintLabel(this.hintCopyNode), this.showHint(this.hintCopyNode));
    }

    getClientSeed() {
        // handle
    }

    setClientSeedUIState(isEnable: boolean) {
        // handle
    }

    handleResetNewRound() {
        // handle
    }
}

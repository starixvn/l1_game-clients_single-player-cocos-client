import { i18n } from "../../../../ClientModules";
import GameUtils from "../../../../common/GameUtils";
import AudioManager from "../../../../common/audio/AudioManager";
import { getLanguage, getLocale } from "../../../../common/auth/SessionManager";
import WebViewVerification from "../../../../common/webview-guide/WebViewVerification";
import { ClientSeedInfo } from "./ClientSeedInfo";
import ProvablyFairVerifyComponent, { OPEN_PROVABLY_FAIR_VERIFY } from "./ProvablyFairVerifyComponent";

const { ccclass, property } = cc._decorator;

export interface IRoundBaseProvablyFairVerify {
    clientSeeds: any;
    mergeClientSeed: string;
    mergeSeed: string;
    serverSeed: string;
    serverSeedHash: string;
    result: object;
    finalHash: string;
    roundId: number;
}

@ccclass
export default class GameRoundBasePFVerifyComponent extends ProvablyFairVerifyComponent {
    @property(cc.Label)
    lblRoundId: cc.Label = null;

    @property(cc.Label)
    lblParaVerification: cc.Label = null;

    @property(cc.Node)
    clientSeedsContainer: cc.Node = null;

    @property(cc.Node)
    nodeDisabledVerification: cc.Node = null;

    @property(cc.Label)
    lblMergeClientSeed: cc.Label = null;

    @property(cc.Node)
    hintMergeClientCopyNode: cc.Node = null;

    @property(cc.Prefab)
    verificationPrefab: cc.Prefab = null;

    @property(cc.Node)
    verificationContainer: cc.Node = null;

    protected listClientSeedInfo: ClientSeedInfo[] = [];

    protected mergeSeedClientCopyString = "";

    protected provablyFair: IRoundBaseProvablyFairVerify;

    onLoad() {
        this.initClientSeedsList();

        this.commonDialog.addOnDidHide(() => {
            this.statusNode(false);
            this.verificationContainer?.destroyAllChildren();
            this.guideContainer?.destroyAllChildren();
        });
        const para = i18n.t(`pf.pf_provably_fair_para_2`);
        this.lblParaVerification.string = para;
    }

    onCopyMergeSeedClient() {
        GameUtils.copyToClipboard(
            this.mergeSeedClientCopyString,
            this.getHintLabel(this.hintMergeClientCopyNode),
            this.showHint(this.hintMergeClientCopyNode)
        );
    }

    updateProvablyFairVerify(verification: IRoundBaseProvablyFairVerify) {
        this.provablyFair = verification;
        const { serverSeed, serverSeedHash, mergeClientSeed, finalHash, clientSeeds, result, roundId } = verification;
        this.lblRoundId.string = roundId?.toString() ?? "";
        result && this.renderResult(result);
        if (!this.node.activeInHierarchy && this.node?.isValid) {
            this.serverSeedLbl.string = this.truncateString(serverSeed ?? "".toString());
            this.serverSeedCopyString = serverSeed ?? "";
            this.lblMergeClientSeed.string = mergeClientSeed ?? "".toString();
            this.mergeSeedClientCopyString = mergeClientSeed ?? "";
            this.serverSeedSHA256Lbl.string = this.truncateString(serverSeedHash ?? "".toString());
            this.hashCopyString = serverSeedHash ?? "";
            this.finalResultLbl.string = this.truncateString(finalHash ?? "".toString());
            this.finalResultCopyString = finalHash ?? "";
        }

        if (this.listClientSeedInfo.length === 0) {
            this.initClientSeedsList();
        }
        this.listClientSeedInfo.forEach((clientSeedInfo) => {
            clientSeedInfo.activeDisabledBg(true);
            clientSeedInfo.resetClientSeedData();
        });
        if (clientSeeds && clientSeeds.length > 0) {
            clientSeeds.forEach((clientSeed, index) => {
                const info = this.listClientSeedInfo[index];
                info.setDisplay(clientSeed);
                info.activeDisabledBg(false);
            });
        }
        this.nodeDisabledVerification.active = !result;
        this.node.emit(OPEN_PROVABLY_FAIR_VERIFY);
    }

    onShow() {
        this.statusNode(true);
        this.commonDialog.showDialog();
    }

    protected initClientSeedsList() {
        this.listClientSeedInfo = this.clientSeedsContainer?.getComponentsInChildren(ClientSeedInfo);
    }

    private renderResult(result: any) {
        if (this.nodeResult) {
            const resultComp = this.nodeResult?.getComponentInChildren(BaseResultBodyItem);
            resultComp.setData(result, result);
        }
    }

    onClickVerify() {
        AudioManager.getInstance().playClick();
        const dialog = cc.instantiate(this.verificationPrefab);
        const verification = dialog.getComponent(WebViewVerification);
        verification?.setRoundId(this.provablyFair?.roundId);
        const locale = getLocale();
        const language = getLanguage(locale);
        verification?.initURLVerification(this.gameId, language);
        verification?.sendDataToIframe(this.provablyFair);
        this.verificationContainer?.addChild(dialog);
        verification?.loadWebView();
    }
}

export class BaseResultBodyItem extends cc.Component {
    setData(result: any, settlementResult: any) {}
}

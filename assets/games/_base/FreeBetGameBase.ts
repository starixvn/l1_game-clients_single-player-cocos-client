import { numberWithCommas } from "../../common/helpers/NumberHelper";
import UserProfile from "../../common/user-profile/UserProfile";
import { userManager } from "../../common/user/UserManager";
import SedieWallet from "../sedie/view-models/SedieWallet";
import MultiOrientationGame from "./MultiOrientationGame";
import { Orientation } from "./Orientation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FreeBetGameBase extends MultiOrientationGame {
    @property
    enabledFreeBet = false;

    @property({
        type: cc.Node,
        visible: function () {
            return this.enabledFreeBet;
        }
    })
    walletWrapper: cc.Node = null;

    @property({
        type: SedieWallet,
        visible: function () {
            return this.enabledFreeBet;
        }
    })
    dollarWallet: SedieWallet = null;

    @property({
        type: SedieWallet,
        visible: function () {
            return this.enabledFreeBet;
        }
    })
    userScoinWallet: SedieWallet = null;

    @property({ type: UserProfile })
    userProfile: UserProfile = null;

    private isFreeBet = false;
    private isFocusScoin = false;
    protected wrapperLayout: cc.Layout = null;

    onLoad() {
        super.onLoad();
        this.loadDollarWalletUI();
    }

    onChangeWalletClick(e, isFreeBet) {
        if (this.gameConfigs.enableFreeBet) {
            this.isFreeBet = isFreeBet === "true";
            this.focusWallet(this.isFreeBet);
        }
    }

    public updateDisplayForRemoteConfig(): void {
        super.updateDisplayForRemoteConfig();

        this.updateDisplayScoinUI(userManager.scoins);
    }

    updateDisplayScoinUI(scoins) {
        if (this.gameConfigs && this.gameConfigs.enableFreeBet) {
            this.userScoinWallet.balance.string = numberWithCommas(scoins);

            if (!this.isFocusScoin && scoins > 0) {
                this.isFocusScoin = true;
                this.isFreeBet = true;

                this.walletWrapper.getComponent(cc.Sprite).enabled = false;

                this.wrapperLayout.updateLayout();
                this.userScoinWallet.node.active = true;

                this.focusWallet(this.isFreeBet);
            }

            if (scoins > 0) {
                this.wrapperLayout.enabled = true;
            }
        }
    }

    loadUserData(user) {
        super.loadUserData(user);

        if (void 0 !== user.scoins) {
            this.updateDisplayScoinUI(user.scoins);
        }
    }

    loadDollarWalletUI() {
        if (!this.enabledFreeBet || !this.walletWrapper || !this.dollarWallet || !this.userScoinWallet) {
            return;
        }

        this.wrapperLayout = this.walletWrapper.getComponent(cc.Layout);
        this.dollarWallet.node.active = true;
        this.dollarWallet.overlay.active = false;
        this.userScoinWallet.node.active = false;

        if (this.orientation === Orientation.Landscape) {
            this.walletWrapper.getComponent(cc.Sprite).enabled = true;
            this.wrapperLayout.enabled = false;
            this.walletWrapper.width = 160;
        } else {
            this.dollarWallet.showActiveBackground(false);
        }
    }

    focusWallet(isFreeBet: boolean) {
        this.wrapperLayout.enabled = isFreeBet;
        this.userScoinWallet.focus(isFreeBet);
        this.dollarWallet.focus(!isFreeBet);
    }

    createCommonBetData() {
        const betData = super.createCommonBetData();
        betData["freeBet"] = this.isFreeBet;
        return betData;
    }
}

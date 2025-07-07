import Banner from "./Banner";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotNavigation extends cc.Component {
    @property(cc.Toggle)
    adsToggle: cc.Toggle = null;

    @property(cc.Toggle)
    jackpotToggle: cc.Toggle = null;

    banner: Banner;

    public onInit(banner: Banner): void {
        this.banner = banner;
    }

    onBannerTypeChanged(e, param) {
        const type = +param;
        const showJackpot = type === 1;
        this.banner.switchBanner(showJackpot, true);
    }
}

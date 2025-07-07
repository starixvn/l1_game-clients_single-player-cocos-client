import BannerController from './BannerController';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameAds extends BannerController {
    onLoad() {
        super.onLoad();
        this.dragThreshold = 0.5;
    }

    start() {
        this.autoChange();
    }
}

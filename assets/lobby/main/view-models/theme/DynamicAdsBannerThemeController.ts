import DynamicAdsBannerController from "../DynamicAdsBannerController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DynamicAdsBannerThemeController extends DynamicAdsBannerController {
    @property({ type: cc.Prefab, override: true, visible: false })
    adsItemPrefab: cc.Prefab = null;

    protected override async createAdsItem(id: number) {
        try {
            return await this.createAdsSpine(id);
        } catch (e) {
            console.warn("Catch error after await method", e.message);
        }

        return false;
    }
}

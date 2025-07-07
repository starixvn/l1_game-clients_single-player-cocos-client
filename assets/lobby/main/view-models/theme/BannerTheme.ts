import Banner from "../Banner";
import { themeResourceLoader } from "./ResourceLoader";

const { ccclass } = cc._decorator;

@ccclass
export default class BannerTheme extends Banner {
    protected override getPrefabBannerContainer() {
        return themeResourceLoader?.loadPrefab("banner/bannerContainer");
    }

    protected override getPathJackpotContainer() {
        return themeResourceLoader?.loadPrefab("banner/jackpotController");
    }

    protected override getPathJackpotNavigation() {
        return themeResourceLoader?.loadPrefab("banner/jackpotNavigation");
    }
}

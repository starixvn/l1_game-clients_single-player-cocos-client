import GameUtils from "../GameUtils";
import PrefabLoaderV2 from "../PrefabLoaderV2";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadInGameMenuPrefab extends PrefabLoaderV2 {
    @property(cc.Prefab)
    mobilePrefab: cc.Prefab = null;

    protected createInstance() {
        if (GameUtils.isPhone() && this.mobilePrefab) {
            this.instance = cc.instantiate(this.mobilePrefab);
        } else {
            this.instance = cc.instantiate(this.prefab);
        }
    }
}

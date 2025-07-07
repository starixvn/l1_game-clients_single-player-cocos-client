import { SystemType } from "../ISystem";
import { ComponentSystem, ICashSystem, ICreditSystem } from "../System";
import GameUtils from "./GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomSystemPrefab extends ComponentSystem implements ICreditSystem, ICashSystem {
    @property
    prefabPath = "";

    @property
    prefabName = "";

    customPath: string;

    customizeCredit(): void {
        this.customPath = SystemType.SC1;
    }
    customizeCash(): void {
        this.customPath = SystemType.SC2;
    }

    onLoad() {
        GameUtils.loadResource(`${this.prefabPath}/${this.customPath}/${this.prefabName}`).then((prefab) => {
            const node = cc.instantiate(prefab);
            this.node?.addChild(node);
        });
    }
}

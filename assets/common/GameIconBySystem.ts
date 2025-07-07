import { SystemType } from "../ISystem";
import { ComponentSystem, ICashSystem, ICreditSystem } from "../System";
import LobbyUtils from "./LobbyUtils";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu(`Common/${GameIconBySystem.name}`)
export default class GameIconBySystem extends ComponentSystem implements ICreditSystem, ICashSystem {
    @property
    gameId = 0;

    system: string;

    customizeCredit(): void {
        this.system = SystemType.SC1;
    }

    customizeCash(): void {
        this.system = SystemType.SC2;
    }

    onLoad() {
        LobbyUtils.loadGameIcon(this.gameId, this.system).then((prefab) => {
            const node = cc.instantiate(prefab);
            this.node?.addChild(node);
        });
    }
}

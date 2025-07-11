import { SystemType } from "../ISystem";
import { ComponentSystem, ICashSystem, ICreditSystem } from "../System";
// Removed lobby import - creating stub implementation

// Stub implementation for LobbyUtils
class LobbyUtils {
    static async loadGameIcon(gameId: number, system: string): Promise<cc.Prefab> {
        // Stub implementation - return null since lobby is removed
        console.warn("[GameIconBySystem] LobbyUtils.loadGameIcon called but lobby is removed");
        return null;
    }
}

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

import { injectable } from "inversify";

import * as configs from "./configs/Configs.js";
import { ISystem, SystemType } from "./ISystem";

console.log("[System] Loading System module...");

export interface ICreditSystem extends ISystem {
    customizeCredit(): void;
}

export interface ICashSystem extends ISystem {
    customizeCash(): void;
}

@injectable()
export class System implements ISystem {
    constructor() {
        console.log("[System] System instance created");
        this.initSystem();
    }

    initSystem(): void {
        console.log("[System] Initializing system...");
        customizeSystems(this);
        console.log("[System] System initialization completed");
    }
}

@injectable()
export class ComponentSystem extends cc.Component implements ISystem {
    constructor() {
        super();
        console.log("[System] ComponentSystem instance created");
        this.initSystem();
    }

    initSystem(): void {
        console.log("[System] Initializing component system...");
        customizeSystems(this);
        console.log("[System] Component system initialization completed");
    }
}

const customizeSystems = (systemInstance: ISystem): void => {
    console.log("[System] Customizing systems, system type:", configs.systemType);
    switch (configs.systemType) {
        case SystemType.SC1:
            console.log("[System] Applying SC1 system customization");
            if (systemInstance) {
                const system = systemInstance as ICreditSystem;
                console.log("[System] Calling customizeCredit()");
                system.customizeCredit();
            }
            break;

        case SystemType.SC2:
            console.log("[System] Applying SC2 system customization");
            if (systemInstance) {
                const system = systemInstance as ICashSystem;
                console.log("[System] Calling customizeCash()");
                system.customizeCash();
            }
            break;

        default:
            console.warn("[System] Unknown system type:", configs.systemType);
            break;
    }
    console.log("[System] System customization completed");
};

console.log("[System] System module loaded successfully");

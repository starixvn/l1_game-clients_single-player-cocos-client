import { injectable } from "inversify";

import * as configs from "./configs/Configs.js";
import { ISystem, SystemType } from "./ISystem";

export interface ICreditSystem extends ISystem {
    customizeCredit(): void;
}

export interface ICashSystem extends ISystem {
    customizeCash(): void;
}

@injectable()
export class System implements ISystem {
    constructor() {
        this.initSystem();
    }

    initSystem(): void {
        customizeSystems(this);
    }
}

@injectable()
export class ComponentSystem extends cc.Component implements ISystem {
    constructor() {
        super();
        this.initSystem();
    }

    initSystem(): void {
        customizeSystems(this);
    }
}

const customizeSystems = (systemInstance: ISystem): void => {
    switch (configs.systemType) {
        case SystemType.SC1:
            if (systemInstance) {
                const system = systemInstance as ICreditSystem;
                system.customizeCredit();
            }
            break;

        case SystemType.SC2:
            if (systemInstance) {
                const system = systemInstance as ICashSystem;
                system.customizeCash();
            }
            break;
    }
};

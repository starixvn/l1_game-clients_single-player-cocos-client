import { injectable } from "inversify";
import { ICashSystem, ICreditSystem, System } from "../../System";
import { SystemType } from "../../ISystem";

@injectable()
export default class SplashConfig extends System implements ICreditSystem, ICashSystem {
    constructor() {
        super();
    }

    enabledSC1: boolean;
    customPath: string;

    customizeCredit(): void {
        this.enabledSC1 = true;
        this.customPath = SystemType.SC1;
    }

    customizeCash(): void {
        this.enabledSC1 = false;
        this.customPath = SystemType.SC2;
    }
}

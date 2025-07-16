import { injectable } from "inversify";
import { ICashSystem, ICreditSystem, System } from "../../System";
import { SystemType } from "../../ISystem";

@injectable()
export default class SplashConfig extends System implements ICreditSystem, ICashSystem {
    constructor() {
        super();
        console.log('[SplashConfig] SplashConfig instance created');
    }

    enabledSC1: boolean;
    customPath: string;

    customizeCredit(): void {
        console.log('[SplashConfig] Customizing for credit system');
        this.enabledSC1 = true;
        this.customPath = SystemType.SC1;
        console.log(`[SplashConfig] Credit system configured - enabledSC1: ${this.enabledSC1}, customPath: ${this.customPath}`);
    }

    customizeCash(): void {
        console.log('[SplashConfig] Customizing for cash system');
        this.enabledSC1 = false;
        this.customPath = SystemType.SC2;
        console.log(`[SplashConfig] Cash system configured - enabledSC1: ${this.enabledSC1}, customPath: ${this.customPath}`);
    }
}

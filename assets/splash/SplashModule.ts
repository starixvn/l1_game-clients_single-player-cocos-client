import { appContainer } from "../Application";
import SplashConfig from "./view-models/SplashConfig";

console.log("[SplashModule] Loading SplashModule...");

export default class SplashModule {
    constructor() {
        console.log("[SplashModule] SplashModule constructor called");
        console.log("[SplashModule] Binding SplashConfig to app container...");
        appContainer.bind<SplashConfig>(SplashConfig).toSelf().inSingletonScope();
        console.log("[SplashModule] SplashConfig bound successfully");
        console.log("[SplashModule] SplashModule initialization completed");
    }
}

console.log("[SplashModule] Creating SplashModule instance...");
new SplashModule();
console.log("[SplashModule] SplashModule instance created successfully");
console.log("[SplashModule] SplashModule loaded successfully");

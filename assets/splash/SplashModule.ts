import { appContainer } from "../Application";
import SplashConfig from "./view-models/SplashConfig";

export default class SplashModule {
    constructor() {
        appContainer.bind<SplashConfig>(SplashConfig).toSelf().inSingletonScope();
    }
}

new SplashModule();

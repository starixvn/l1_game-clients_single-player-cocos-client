import { appContainer } from "../../../Application";
import BlackJackConfig from "./BlackJackConfig";

export default class BlackJackModule {
    constructor() {
        appContainer.bind<BlackJackConfig>(BlackJackConfig).toSelf().inSingletonScope();
    }
}

new BlackJackModule();

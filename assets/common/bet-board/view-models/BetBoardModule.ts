import { appContainer } from "../../../Application";
import BetBoardConfig from "./BetBoardConfig";

export default class BetBoardModule {
    constructor() {
        appContainer.bind<BetBoardConfig>(BetBoardConfig).toSelf().inSingletonScope();
    }
}

new BetBoardModule();

import { appContainer } from "../../../Application";
import OldMiniGameConfig from "./OldMiniGameConfig";

export default class OldMiniGameModule {
    constructor() {
        appContainer.bind<OldMiniGameConfig>(OldMiniGameConfig).toSelf().inSingletonScope();
    }
}

new OldMiniGameModule();

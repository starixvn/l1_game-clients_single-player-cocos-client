import "reflect-metadata";

import axios from "axios";
import { BundleManager } from "bundle-management";
import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";

import { AXIOS_FAILED_PREFIX } from "./utils";

export class Application {
    constructor(public readonly container = new Container()) {}
}

BundleManager.initialize({
    adapters: {
        assetManager: () => cc.assetManager,
        http: () => ({
            get: (url: string) =>
                axios
                    .get(url)
                    .then((res) => res.data)
                    .catch((error) => {
                        throw new Error(`${AXIOS_FAILED_PREFIX} BundleManager get ${url}: ${error.message}`);
                    })
        })
    },
    listeners: []
});

const app = new Application();

const { lazyInject } = getDecorators(app.container);
const appContainer = app.container;
export { appContainer, lazyInject };

declare global {
    interface Window {
        reCheckInId: any;
        modules: any;
    }
}

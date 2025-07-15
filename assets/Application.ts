import "reflect-metadata";

import axios from "axios";
import { BundleManager } from "bundle-management";
import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";

import { AXIOS_FAILED_PREFIX } from "./utils";

export class Application {
    constructor(public readonly container = new Container()) {
    }
}

BundleManager.initialize({
    adapters: {
        assetManager: () => {
            return cc.assetManager;
        },
        http: () => ({
            get: (url: string) => {
                return axios
                    .get(url)
                    .then((res) => {
                        return res.data;
                    })
                    .catch((error) => {
                        console.error("[Application] BundleManager: HTTP GET failed for:", url, "Error:", error.message);
                        throw new Error(`${AXIOS_FAILED_PREFIX} BundleManager get ${url}: ${error.message}`);
                    })
            }
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

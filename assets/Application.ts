import "reflect-metadata";

import axios from "axios";
import { BundleManager } from "bundle-management";
import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";

import { AXIOS_FAILED_PREFIX } from "./utils";

console.log("[Application] Starting application initialization...");

export class Application {
    constructor(public readonly container = new Container()) {
        console.log("[Application] Application instance created with container:", container);
    }
}

console.log("[Application] Initializing BundleManager...");
BundleManager.initialize({
    adapters: {
        assetManager: () => {
            console.log("[Application] BundleManager: Getting asset manager");
            return cc.assetManager;
        },
        http: () => ({
            get: (url: string) => {
                console.log("[Application] BundleManager: Making HTTP GET request to:", url);
                return axios
                    .get(url)
                    .then((res) => {
                        console.log("[Application] BundleManager: HTTP GET successful for:", url);
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
console.log("[Application] BundleManager initialization completed");

console.log("[Application] Creating application instance...");
const app = new Application();

console.log("[Application] Setting up dependency injection decorators...");
const { lazyInject } = getDecorators(app.container);
const appContainer = app.container;
export { appContainer, lazyInject };

console.log("[Application] Setting up global declarations...");
declare global {
    interface Window {
        reCheckInId: any;
        modules: any;
    }
}

console.log("[Application] Application initialization completed successfully");

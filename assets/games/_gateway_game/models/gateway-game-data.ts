import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import { StoreBase } from "./definitions";

export class GameData extends EventEmitterBase {
    protected readonly stores: StoreBase[] = [];
    protected readonly eventHandlers: BaseEventHandler<any>[] = [];

    initHandlers(handlers: any[]) {
        this.eventHandlers.push(...handlers.map((Handler) => new Handler(this)));
    }

    addStores(stores: StoreBase[]) {
        this.stores.push(...stores);
    }

    getStore(storeName: string) {
        return this.stores.find((store) => store.storeName === storeName);
    }

    receiveData(data: unknown) {
        this.eventHandlers.forEach((handler) => handler.onReceiveEvent(data));
    }

    reset() {
        this.stores.forEach((store) => store.reset());
    }
}

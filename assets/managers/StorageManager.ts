console.log("[StorageManager] Loading StorageManager module...");

interface Storage {
    remove: (name: string) => void;
    get: (name: string) => any;
    set: (name: string, value: any, expiresDay?: number) => void;
    isAvailable: () => boolean;
}

function isString(value: any): value is string {
    return typeof value === "string";
}

class LocalStorage implements Storage {
    remove(name: string) {
        console.log("[StorageManager] Removing from localStorage:", name);
        localStorage?.removeItem(name);
    }

    get(name: string) {
        console.log("[StorageManager] Getting from localStorage:", name);
        let storage;
        try {
            storage = localStorage.getItem(name);
            if (storage === "") {
                console.log("[StorageManager] Empty storage value for:", name);
                return null;
            }
            const result = storage ? JSON.parse(storage) : null;
            console.log("[StorageManager] Retrieved from localStorage:", name, "value:", result);
            return result;
        } catch (error) {
            console.error("[StorageManager] Error parsing localStorage value for:", name, "error:", error);
            return storage ?? null;
        }
    }

    set(name: string, value: any) {
        console.log("[StorageManager] Setting localStorage:", name, "value:", value);
        const valueFormat: string = isString(value) ? value : JSON.stringify(value);
        localStorage?.setItem(name, valueFormat);
        console.log("[StorageManager] Successfully set localStorage:", name);
    }

    isAvailable() {
        const test = "test";
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            console.log("[StorageManager] LocalStorage is available");
            return true;
        } catch (e) {
            console.log("[StorageManager] Browser not support Local Storage");
            return false;
        }
    }
}

declare global {
    interface Window {
        localMemory: any;
    }
}

class Memory implements Storage {
    localMemory: any;
    constructor() {
        console.log("[StorageManager] Initializing Memory storage");
        window.localMemory = {};
        this.localMemory = window.localMemory;
    }
    remove(name: string) {
        console.log("[StorageManager] Removing from memory:", name);
        delete this.localMemory[name];
    }

    get(name: string) {
        console.log("[StorageManager] Getting from memory:", name);
        const result = this.localMemory[name] ? this.localMemory[name] : null;
        console.log("[StorageManager] Retrieved from memory:", name, "value:", result);
        return result;
    }

    set(name: string, value: any) {
        console.log("[StorageManager] Setting memory:", name, "value:", value);
        this.localMemory[name] = value;
        console.log("[StorageManager] Successfully set memory:", name);
    }

    isAvailable() {
        console.log("[StorageManager] Memory storage is available");
        return true;
    }
}

class StorageManager {
    private static _storage: Storage;

    private static get storage() {
        if (!this._storage) {
            console.log("[StorageManager] Initializing storage manager");
            const storages = [new LocalStorage(), new Memory()];
            this._storage = storages.filter((storage) => storage.isAvailable())[0];
            console.log("[StorageManager] Storage type selected:", this._storage.constructor.name);
        }
        return this._storage;
    }

    static get(name: string) {
        console.log("[StorageManager] Getting storage value for:", name);
        const result = this.storage.get(name);
        console.log("[StorageManager] Storage get result:", result);
        return result;
    }

    static set(name: string, value: any) {
        console.log("[StorageManager] Setting storage value for:", name, "value:", value);
        this.storage.set(name, value);
        console.log("[StorageManager] Storage set completed");
    }

    static remove(name: string) {
        console.log("[StorageManager] Removing storage value for:", name);
        this.storage.remove(name);
        console.log("[StorageManager] Storage remove completed");
    }
}

export { StorageManager };

console.log("[StorageManager] StorageManager module loaded successfully");


export default class LobbyDialogManager {
    private static instance: LobbyDialogManager;

    public static getInstance(): LobbyDialogManager {
        if (!this.instance) {
            this.instance = new LobbyDialogManager();
        }
        return this.instance;
    }

    isDialogOpened = false;
    queue: { cb: () => void; name: string }[] = [];
    isCleared = false;
    private currentDialogName = "";

    addDialog(cbFunction: () => void, name: string) {
        const isAlreadyHandled = this.currentDialogName === name || this.queue.some((item) => item.name === name);

        if (isAlreadyHandled) {
            return;
        }
        if (!this.isDialogOpened) {
            cbFunction();
            this.isDialogOpened = true;
            this.setDialogState(true, name);
        } else {
            this.queue.push({ cb: cbFunction, name });
        }
    }

    onCloseDialog() {
        this.setDialogState(false);

        if (this.queue.length > 0) {
            const { cb, name } = this.queue.shift();
            cb();
            this.setDialogState(true, name);
        }
    }

    private setDialogState(opened: boolean, name = "") {
        this.isDialogOpened = opened;
        this.currentDialogName = name;
    }

    clearQueue() {
        this.queue = [];
        this.isDialogOpened = false;
        this.isCleared = true;
    }
}

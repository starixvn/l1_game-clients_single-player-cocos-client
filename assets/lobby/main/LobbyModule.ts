console.log("[LobbyModule] Loading LobbyModule...");

export default class LobbyModule {
    constructor() {
        console.log("[LobbyModule] LobbyModule constructor called");
        this.initializeLobby();
    }

    private initializeLobby() {
        console.log("[LobbyModule] Initializing lobby...");
        // Add any lobby initialization logic here
        console.log("[LobbyModule] Lobby initialization completed");
    }
}

console.log("[LobbyModule] Creating LobbyModule instance...");
new LobbyModule();
console.log("[LobbyModule] LobbyModule instance created successfully");
console.log("[LobbyModule] LobbyModule loaded successfully");

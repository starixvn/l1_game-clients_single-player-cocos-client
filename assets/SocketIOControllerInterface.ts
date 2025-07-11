console.log("[SocketIOControllerInterface] Loading SocketIOControllerInterface module...");

export default interface SocketIOControllerInterface {
    gameScene: any;
    openGameSocket(gameId);
    createGatewayGameSocket(gameId);
    closeSocket(gameId);
    initBaseListenersForSocketUrl(socket, gameId, onConnectSocketFailed, onConnectCallback);
}

console.log("[SocketIOControllerInterface] SocketIOControllerInterface module loaded successfully");

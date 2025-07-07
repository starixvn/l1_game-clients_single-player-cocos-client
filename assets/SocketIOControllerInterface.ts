export default interface SocketIOControllerInterface {
    gameScene: any;
    openGameSocket(gameId);
    createGatewayGameSocket(gameId);
    closeSocket(gameId);
    initBaseListenersForSocketUrl(socket, gameId, onConnectSocketFailed, onConnectCallback);
}

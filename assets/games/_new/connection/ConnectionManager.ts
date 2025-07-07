import Connection from "./Connection";
import SocketIOConnection from "./SocketIOConnection";

export default class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Record<string, Connection> = {};

  public static getInstance(): ConnectionManager {
    if (!this.instance) {
      this.instance = new ConnectionManager();
    }

    return this.instance;
  }

  useSocketIO(socketUri: string, gameName: string, onConnectFailed: (gameName: string) => void, proxyRoute: string) {
    const connection = new SocketIOConnection({ socketUri, gameName, onConnectFailed, proxyRoute });
    return {
      createNewConnection: () => this.storeConnection(gameName, connection),
    };
  }

  getConnection(gameName: string) {
    return this.connections[gameName];
  }

  closeConnection(game: string) {
    const connection = this.connections[game];

    if (connection) {
      connection.close();
      delete this.connections[game];
    }
  }

  closeAllConnections() {
    for (const key in this.connections) {
      const connection = this.connections[key];

      connection.close();
    }

    this.connections = {};
  }

  broadcast(event: string, payload: any) {
    Object.values(this.connections).forEach((connection) => connection.emit(event, payload));
  }

  private storeConnection(game: string, connection: Connection) {
    this.connections[game] = connection;

    return connection;
  }
}

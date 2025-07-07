import "reflect-metadata";
import { appContainer } from "./Application";

import SocketIOController from "./SocketIOController";
import LobbyMenuConfig from "./lobby/main/view-models/LobbyMenuConfig";

const configureServices = () => {
    const container = appContainer;
    container.bind<SocketIOController>(SocketIOController).toSelf().inSingletonScope();
    container.bind<LobbyMenuConfig>(LobbyMenuConfig).toSelf().inSingletonScope();
};

configureServices();

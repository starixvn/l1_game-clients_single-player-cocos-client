import "reflect-metadata";
import { appContainer } from "./Application";

import SocketIOController from "./SocketIOController";

const configureServices = () => {
    const container = appContainer;
    container.bind<SocketIOController>(SocketIOController).toSelf().inSingletonScope();
};

configureServices();

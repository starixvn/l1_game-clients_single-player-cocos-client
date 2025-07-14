import WebSocketTableGameBase from "../../_base/WebSocketTableGameBase";

export const handleUM = (main: WebSocketTableGameBase) => (message: string) => {
    main.showUmMessage({ um_message: message });
    main.stopGame();
};

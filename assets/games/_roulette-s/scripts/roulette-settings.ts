import { Socket } from "socket.io-client";
import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import RouletteLeaderBoardSetting from "./roulette-leader-board-setting";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RouletteSettings extends cc.Component {

    @property(cc.Node)
    mainFrame: cc.Node = null;

    @property(RouletteLeaderBoardSetting)
    leaderBoardSetting: RouletteLeaderBoardSetting = null;

    protected socket: Socket;
    protected gameName: string;

    onLoad() {
        const commonDialog = this.mainFrame.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }

    init(socket: Socket, gameName: string) {
        this.socket = socket;
        this.gameName = gameName;
        
        if (this.leaderBoardSetting) {
            this.leaderBoardSetting.init(this.socket, this.gameName);
        }
    }
}

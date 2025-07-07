import { UserHandler } from "./UserHandler";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Common/AutoUpdateBalance")
export default class AutoUpdateBalance extends cc.Component {
  private readonly intervalTime = 60;
  private userHandler: UserHandler;

  start() {
    this.userHandler = UserHandler.getInstance();
    this.schedule(() => {
      this.userHandler.updateBalance();
    }, this.intervalTime);
  }
}

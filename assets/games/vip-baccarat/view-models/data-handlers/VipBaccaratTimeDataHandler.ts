import VipBaccarat from "../VipBaccarat";
import BaccaratTimeHandler from "../../../baccarat/view-models/data-handlers/BaccaratTimeDataHandler";

export default class VipBaccaratTimeDataHandler extends BaccaratTimeHandler {
    protected getOwnMain(): any {
        return this.main as VipBaccarat;
    }
}

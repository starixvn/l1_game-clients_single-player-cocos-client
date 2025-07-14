import AudioManager from "../../../../common/audio/AudioManager";
import VipSedieTimeHandler from "../../../vip-sedie/view-models/handlers/VipSedieTimeHandler";
import VipSedieWar from "../VipSedieWar";

export default class VipSedieWarTimeHandler extends VipSedieTimeHandler {
    constructor(readonly main: VipSedieWar) {
        super(main);
    }

    shakeThePlate() {
        cc.tween(this.main)
            .call(() => this.main.closePlate())
            .delay(0.5)
            .call(() => {
                AudioManager.getInstance().playSFX(this.main.shakeThePlateAudio.clip);
                this.main.dishes.forEach((dish) => {
                    dish.shake();
                });
            })
            .start();
    }
}

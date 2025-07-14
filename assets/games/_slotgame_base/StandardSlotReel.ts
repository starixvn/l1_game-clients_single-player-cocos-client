import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { ClassicSlotSound } from "./ClassicSlotSound";
import SlotReel from "./SlotReel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardSlotReel extends SlotReel {
    itemCountPerReel = 24;

    blurSymbols() {
        this.items.forEach((item, index) => {
            if (index < 4 || index >= this.itemCount - 4) {
                item.handleBlurAnim(false);
            } else {
                item.handleBlurAnim(true);
            }
        });
    }

    normalSymbols() {
        this.items.forEach((item) => {
            item.handleBlurAnim(false);
        });
    }

    getChangeDataDelayTime(spinDuration: number): number {
        return 0.4 * spinDuration;
    }

    spinWithData(spinDuration: number, data: number[], turbo: boolean) {
        if (!turbo) {
            spinDuration = (spinDuration * this.itemCount) / this.itemCountPerReel;
        }
        return super.spinWithData(spinDuration, data, turbo);
    }

    playSpinAnimTurbo(spinDuration: number, offset: number, onReelStopped: () => void) {
        cc.tween(this.node)
            .to(spinDuration, { position: cc.v2(this.node.x, offset) }, { easing: (dt) => cc.easeInOut(3).easing(dt) })
            .call(() => {
                this.onSpinFinish();
                onReelStopped();
            })
            .start();
    }
    playSpinAnim(turbo: boolean, spinDuration: number, offset: number, onReelStopped: () => void) {
        if (!turbo) {
            const moveDownDuration = 0.25;
            const moveUpDuration = 0.35;
            const normalSpinDuration = spinDuration - moveUpDuration - moveDownDuration;

            cc.tween(this.node)
                .to(moveDownDuration, { position: cc.v2(this.node.x, -300) }, { easing: "backIn" })
                .to(normalSpinDuration, { position: cc.v2(this.node.x, offset + 300) })
                .parallel(
                    cc.tween().to(moveUpDuration, { position: cc.v2(this.node.x, offset) }, { easing: "backOut" }),
                    cc
                        .tween()
                        .delay(0.15)
                        .call(() => {
                            uiManager.emitter.emit(InternalEvents.SLOT_PLAY_SOUND, ClassicSlotSound.REEL_STOP);
                        })
                )

                .call(() => {
                    this.onSpinFinish();
                    onReelStopped();
                })
                .start();
        } else {
            this.playSpinAnimTurbo(spinDuration, offset, onReelStopped);
        }
    }
}

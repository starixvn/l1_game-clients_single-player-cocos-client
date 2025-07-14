import _ = require("lodash");
import PreviewOddsPopup from "../../_slotgame_base/PreviewOddsPopup";
import CascadeSlotBoard from "./CascadeSlotBoard";
import MultiplierItem from "./MultiplierItem";
import { CascadingSlotGameSound } from "./CascadingSlotGameSound";
import { InternalEvents } from "../../../managers/InternalEvents";
import { uiManager } from "../../../managers/GameUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingSlotBoard extends CascadeSlotBoard {
    @property(PreviewOddsPopup)
    previewPopup: PreviewOddsPopup = null;

    gameId: number;

    public createReels() {
        super.createReels();
        this.previewPopup.gameId = this.gameId;
        this.previewPopup.addPreviewPopup(this.reels);
    }

    showPreview(previewNode: cc.Node, worldPosition: cc.Vec3) {
        this.previewPopup.showPreview(previewNode, worldPosition);
    }

    public addItems(data: number[][]) {
        this.reels.forEach((reel, index) => {
            const items = data[index];
            const reelItems = reel.addItems(items);
            const isInfoOnLeft = index === this.reels.length - 1 || index === this.reels.length - 2;
            reelItems.forEach((item) => {
                this.previewPopup.addReelItemEvent(item, isInfoOnLeft);
            });
        });
    }

    generateRandomBoardData() {
        const samples = [
            [9, 1, 4, 2, 4, 8, 2, 0, 2, 2, 9, 5, 4, 10, 7, 0, 2, 7, 6, 6, 5, 8, 0, 3, 1, 5, 7, 3, 7, 7],
            [3, 4, 7, 7, 5, 2, 4, 5, 5, 3, 1, 10, 0, 9, 3, 7, 8, 3, 5, 7, 6, 6, 8, 7, 3, 0, 5, 0, 2, 7],
            [7, 5, 10, 2, 1, 7, 8, 9, 8, 8, 6, 8, 6, 4, 8, 5, 1, 0, 3, 6, 7, 9, 9, 0, 2, 0, 4, 6, 3, 1],
            [0, 1, 7, 3, 2, 1, 9, 5, 2, 8, 2, 7, 3, 7, 5, 10, 0, 0, 6, 4, 5, 4, 1, 8, 6, 4, 5, 3, 6, 9],
            [3, 6, 4, 0, 5, 2, 2, 2, 3, 7, 8, 4, 4, 3, 4, 9, 7, 4, 1, 10, 0, 1, 4, 2, 5, 9, 2, 1, 9, 0]
        ];
        const multipliers = [[3], [8], [12], [15], [18]];
        const randomIndex = _.random(samples.length - 1);
        console.log(`B${randomIndex}`);
        return { symbols: samples[randomIndex], multipliers: multipliers[randomIndex] };
    }

    protected generateRandomItems() {
        const data = this.generateRandomBoardData();
        const multipliers = data.multipliers;
        const symbols = data.symbols;
        this.reels.forEach((reel, index) => {
            const start = index * reel.itemDisplayCount;
            const end = start + reel.itemDisplayCount;
            const itemData = symbols.slice(start, end);
            reel.setItemData(itemData, multipliers);
        });
    }

    protected setValueMultiplier(index: number, multipliers: number[], multiplierItem: MultiplierItem) {
        multiplierItem.gameId = this.gameId;
        super.setValueMultiplier(index, multipliers, multiplierItem);
    }

    addSoundBoard(clipSound: CascadingSlotGameSound) {
        uiManager.emitter.emit(InternalEvents.CASCADING_SLOT_PLAY_SOUND, clipSound);
    }
}

import _ = require("lodash");

import GameUtils from "../../../common/GameUtils";
import SlotGameSound from "../../_slotgame_base/SlotGameSound";
import CascadeSlotReel from "./CascadeSlotReel";
import { CascadingSlotConfig } from "./CascadingSlotBaseConfig";
import { CascadingSlotGameSound } from "./CascadingSlotGameSound";
import MultiplierItem from "./MultiplierItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadeSlotBoard extends cc.Component {
    boardSound: SlotGameSound;

    public gameId: number;
    protected readonly reels: CascadeSlotReel[] = [];

    public createReels() {
        if (this.reels.length > 0) {
            return;
        }
        this.node.children.forEach((child) => {
            const slotReel = child.getComponent(CascadeSlotReel);
            if (slotReel) {
                slotReel.itemDisplayCount = CascadingSlotConfig.reelItemCount;
                slotReel.gameId = this.gameId;
                slotReel.createReel();
                this.reels.push(slotReel);
            }
        });
    }

    initBoardFullItems() {
        this.createReels();
        this.generateRandomItems();
    }

    protected generateRandomItems() {
        const itemTypeCount = CascadingSlotConfig.itemTypeCount || 0;
        const boardSize = this.reels.length * CascadingSlotConfig.reelItemCount;
        const data = Array.from(Array(itemTypeCount).keys());
        const multipliers = [_.random(2, 20)];

        const randomScatterCount = _.random(2);
        for (let i = 0; i < randomScatterCount; i++) {
            data.push(9);
        }

        while (data.length < boardSize) {
            data.push(_.random(itemTypeCount - 3)); //ignore scatter and multiplier
        }
        const shuffleData = _.shuffle(data);
        this.reels.forEach((reel, index) => {
            const start = index * reel.itemDisplayCount;
            const end = start + reel.itemDisplayCount;
            const itemData = shuffleData.slice(start, end);
            reel.setItemData(itemData, multipliers);
        });
    }

    public setData(symbols: number[][], multiplier: number[]) {
        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].gameId = this.gameId;
            this.reels[i].setItemData(symbols[i], multiplier);
        }
    }

    protected async fallOut(isTurbo: boolean, delay: number) {
        for (let i = 0; i < this.reels.length; i++) {
            if (!isTurbo && i > 0) {
                await GameUtils.delayTime(delay);
            }

            if (i < this.reels.length - 1) {
                this.reels[i].fallOut(isTurbo);
            } else {
                await this.reels[i].fallOut(isTurbo);
            }
        }
    }

    public async spinResult(symbols: number[][], multiplier: number[], isTurbo: boolean) {
        const duration = (5 * 145) / this.reels[0].pixelPerSecond;
        const delay = 0.25 * duration;

        if (isTurbo) {
            this.addSoundBoard(CascadingSlotGameSound.TURBO_DROP_IN);
        } else {
            this.addSoundBoard(CascadingSlotGameSound.DROP_IN);
        }

        await this.fallOut(isTurbo, delay);

        const soundArray = [
            CascadingSlotGameSound.REEL_STOP,
            CascadingSlotGameSound.REEL_STOP_1,
            CascadingSlotGameSound.REEL_STOP_2,
            CascadingSlotGameSound.REEL_STOP_3,
            CascadingSlotGameSound.REEL_STOP_4,
            CascadingSlotGameSound.REEL_STOP_5
        ];
        const playSoundOnBottomItem = (index: number) => () => {
            if (index % 2 === 1) {
                this.addSoundBoard(soundArray[index]);
            }
        };
        for (let i = 0; i < this.reels.length; i++) {
            if (!isTurbo && i > 0) {
                await GameUtils.delayTime(delay);
            }

            if (i < this.reels.length - 1) {
                this.reels[i].spin(symbols[i], multiplier, isTurbo, playSoundOnBottomItem(i));
            } else {
                await this.reels[i].spin(symbols[i], multiplier, isTurbo, playSoundOnBottomItem(i));
            }
        }
    }

    getRandomWinItem(data: number[][], winIcon: number): cc.Node {
        const list = [];
        for (let i = 0; i < this.reels.length; i++) {
            const reelData = data[i];
            for (let j = 0; j < reelData.length; j++) {
                if (reelData[j] === winIcon) {
                    list.push({ i, j });
                }
            }
        }
        const randomIndex = _.random(0, list.length - 1);
        const randomItem = list[randomIndex];
        return this.reels[randomItem.i].getItemNode(randomItem.j);
    }

    async highlightScatterItems() {
        await Promise.all(this.reels.map((reel) => reel.highlightScatterItems()));
    }

    public async removeItems(data: number[][], tumbleIndex: number) {
        const reelItems = this.reels.map((reel, index) => {
            return data[index]
                .map((item, index) => {
                    return item !== -1 ? index : -1;
                })
                .filter((value) => value > -1);
        });

        await Promise.all(
            reelItems.map((items, index) => {
                const reel = this.reels[index];
                return reel.highlightItems(items);
            })
        );

        await Promise.all(
            reelItems.map((items, index) => {
                const reel = this.reels[index];
                return reel.removeItemsByIndex(items);
            })
        );
    }

    public async shakeItems() {
        await Promise.all(
            this.reels.map((reel) => {
                return reel.shakeItems();
            })
        );
    }

    public addItems(data: number[][]) {
        this.reels.forEach((reel, index) => {
            const items = data[index];
            reel.addItems(items);
        });
    }

    public updateMultiplierItems(multipliers: number[]) {
        const multiplierItems = this.getMultiplierItems();
        multiplierItems.forEach((multiplierItem, index) => {
            this.setValueMultiplier(index, multipliers, multiplierItem);
        });
    }

    protected setValueMultiplier(index: number, multipliers: number[], multiplierItem: MultiplierItem) {
        multiplierItem.gameId = this.gameId;
        multiplierItem.setValue(multipliers[index]);
    }

    public getMultiplierItems() {
        const items = this.reels.flatMap((reel) => [...reel.getItems()].reverse());
        return items.flatMap((item) => {
            const comp = item.content.children[0].getComponent(MultiplierItem);
            return comp ? [comp] : [];
        });
    }

    public async fallIn(isTurbo: boolean) {
        await Promise.all(
            this.reels.map(async (reel) => {
                await reel.fallIn(isTurbo, null);
            })
        );
    }

    addSoundBoard(clipSound: CascadingSlotGameSound) {
        this.boardSound.playSound(clipSound);
    }
}

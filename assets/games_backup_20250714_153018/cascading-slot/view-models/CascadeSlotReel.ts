import GameUtils from "../../../common/GameUtils";
import CascadeSlotReelItem from "./CascadeSlotReelItem";
import { CascadingSlotConfig } from "./CascadingSlotBaseConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadeSlotReel extends cc.Component {
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    effectContainer: cc.Node = null;

    @property
    spacing = 15;

    @property
    itemSize = 145;

    itemDisplayCount = CascadingSlotConfig.reelItemCount;
    public gameId: number;

    protected items: CascadeSlotReelItem[] = [];
    public readonly pixelPerSecond = 145 * 15;

    createReel() {
        for (let i = 0; i < this.itemDisplayCount; i++) {
            const item = this.addItem();
            item.node.y = this.getItemPosY(i);
        }
    }

    getItems() {
        return this.items;
    }

    addItem() {
        const node = this.createReelItem();
        const item = node.getComponent(CascadeSlotReelItem);
        item.gameId = this.gameId;
        this.items.push(item);
        return item;
    }

    createReelItem(): cc.Node {
        const node = cc.instantiate(this.itemPrefab);
        this.node.addChild(node);
        return node;
    }

    async spin(data: number[], multiplier: number[], isTurbo: boolean, onSpinEnded: () => void) {
        this.setItemData(data, multiplier);
        this.setStartPositionForItems();
        await this.fallIn(isTurbo, onSpinEnded);
    }

    getItemPosY(index: number) {
        const start = this.spacing + this.itemSize * 0.5;
        return start + index * (this.spacing + this.itemSize);
    }

    setItemData(data: number[], multiplier: number[]) {
        this.items.forEach((item, index) => {
            item.gameId = this.gameId;
            item.setItem(data[index]);
        });

        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.updateMultiplierItem(multiplier);
        }
    }

    setStartPositionForItems() {
        this.items.forEach((item, index) => {
            item.node.y = this.getItemPosY(this.itemDisplayCount + index);
        });
    }

    protected getSpeed(isTurbo: boolean, isFallOut: boolean): number {
        const baseSpeed = isFallOut ? 1.3 * this.pixelPerSecond : this.pixelPerSecond;
        return isTurbo ? baseSpeed * 1.5 : baseSpeed;
    }

    protected getDelayTimeAfterFall(isFallOut: boolean, duration: number, backDuration: number): number {
        return isFallOut ? duration : duration + backDuration;
    }

    async fallWithOffset(offset: number, isTurbo: boolean, onBottomItemEnded?: () => void) {
        const isFallOut = offset < 0;
        const speed = this.getSpeed(isTurbo, isFallOut);
        let duration;

        const backDuration = 0.2;
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const posY = this.getItemPosY(i + offset);
            const distance = Math.abs(posY - item.node.y);
            if (distance < 1) {
                continue;
            }
            duration = distance / speed;
            const delay = 0.08 * duration;
            if (!isTurbo) {
                await GameUtils.delayTime(delay);
            }
            const isBottomItem = i === 0;
            if (isFallOut) {
                cc.tween(item.node).to(duration, { y: posY }, { easing: "sineIn" }).start();
            } else {
                this.fallInWithOffset(item, duration, posY, isBottomItem, onBottomItemEnded);
            }
        }

        await GameUtils.delayTime(this.getDelayTimeAfterFall(isFallOut, duration, backDuration));
    }

    fallInWithOffset(item: CascadeSlotReelItem, duration: number, posY: number, isBottomItem: boolean, onBottomItemEnded?: () => void) {
        const backOffsetY = this.itemSize * 0.2;
        const backDuration = 0.2;

        cc.tween(item.node)
            .to(duration, { y: posY - backOffsetY })
            .call(() => {
                if (isBottomItem) {
                    onBottomItemEnded && onBottomItemEnded();
                }
            })
            .by(backDuration, { y: +backOffsetY }, { easing: "sineOut" })
            .start();
    }

    async fallOut(isTurbo: boolean) {
        await this.fallWithOffset(-this.itemDisplayCount, isTurbo, null);
    }

    async fallIn(isTurbo: boolean, onEnded: () => void) {
        await this.fallWithOffset(0, isTurbo, onEnded);
    }

    getItemNode(index: number): cc.Node {
        const item = this.items[index];
        return item.node;
    }

    async highlightItem(index: number) {
        const item = this.items[index];
        GameUtils.moveToOtherNode(item.node, this.effectContainer);
        const animation = item.getComponentInChildren(cc.Animation);
        animation.play("highlight");
        const duration = animation.currentClip.duration;
        await GameUtils.delayTime(duration);
    }

    async highlightItems(list: number[]) {
        await Promise.all(list.map((index) => this.highlightItem(index)));
    }

    async highlightScatterItems() {
        this.items.forEach((item) => GameUtils.moveToOtherNode(item.node, this.effectContainer));
        const scatterSymbols = this.items.filter((item) => item.isScatterSymbol);
        await Promise.all(scatterSymbols.map((item) => item.highlightScatterItem()));
        this.items.forEach((item) => GameUtils.moveToOtherNode(item.node, this.node));
    }

    async removeItem(index: number) {
        const item = this.items[index];
        const animation = item.getComponentInChildren(cc.Animation);
        animation.play("explode");
        const duration = animation.currentClip.duration;
        await GameUtils.delayTime(duration);
        item.destroy();
    }

    async removeItemsByIndex(list: number[]) {
        await Promise.all(list.map((index) => this.removeItem(index)));
        this.items = this.items.filter((item, index) => !list.includes(index));
    }

    shakeItems() {}

    addItems(data: number[]): CascadeSlotReelItem[] {
        let i = 0;
        const items = [];
        data.forEach((value) => {
            if (value === -1) {
                return;
            }
            const item = this.addItem();
            item.setItem(value);
            items.push(item);
            item.node.y = this.getItemPosY(this.itemDisplayCount + i);
            i++;
        });
        return items;
    }
}

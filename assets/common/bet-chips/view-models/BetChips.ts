import * as _ from "lodash";

import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import GameUtils from "../../GameUtils";
import AudioManager from "../../audio/AudioManager";
import ChipStack from "../../chip-stack/views/ChipStack";
import BetChipsInterface from "./BetChipsInterface";
import ChipConfig from "./ChipConfig";
import ChipView, { ChipDisplayType } from "./ChipView";
import SnappedScrollView from "./SnappedScrollView";

const { ccclass, property } = cc._decorator;
type OnChangedBet = (bet: string) => void;

@ccclass
export default class BetChips extends cc.Component implements BetChipsInterface {
    @property(cc.Node)
    chips: cc.Node = null;

    @property(cc.AudioSource)
    singleChipAudio: cc.AudioSource = null;

    @property(cc.AudioSource)
    multiChipAudio: cc.AudioSource = null;

    @property(cc.AudioSource)
    betChipClickAudio: cc.AudioSource = null;

    @property(cc.SpriteAtlas)
    chipAltas: cc.SpriteAtlas = null;

    @property(SnappedScrollView)
    snappedScrollView: SnappedScrollView = null;

    @property(cc.Node)
    leftButton: cc.Node = null;

    @property(cc.Node)
    rightButton: cc.Node = null;

    @property
    displaySize = 6;

    @property
    movingStep = 1;

    @property(cc.Prefab)
    chipPrefab: cc.Prefab = null;

    @property(cc.SpriteFrame)
    lowValueChipSprite: cc.SpriteFrame = null;

    public gameConfigs: any;
    public chipValues: number[] = [];
    public configValues: number[] = [];
    public onChanged: OnChangedBet = (bet) => {};
    public onClickBetCallback: () => void = () => {};
    public readonly chipFlyingTime: number = 0.8;
    public readonly loginUserChipFlyingTime: number = 0.5;
    public readonly chipDelayFlyingTime: number = 1.25;
    public smallChipScale = 0.29;

    public enableStakeLevel = true;

    public get chipConfig() {
        return ChipConfig.getInstance();
    }
    public selectedIndex = 0;
    public chipList: cc.Node[] = [];

    private currentBetValue = "1";
    private disabledBetChips = false;
    protected needResetCurrentChip = true;

    onLoad() {
        this.setLeftButtonStatus(false);
        this.snappedScrollView.onScrollEnded = () => {
            const min = this.snappedScrollView.getMinDisplayIndex();

            if (this.selectedIndex < min) {
                this.selectedIndex = min;
                this.selectedIndex = Math.min(this.selectedIndex, this.chipList.length - this.displaySize);
            } else if (this.selectedIndex > min + this.displaySize - 1) {
                this.selectedIndex = min + this.displaySize - 1;
            }

            this.updateArrowVisibility();
            this.updateSelectedChipValue();
        };

        uiManager.emitterListener(InternalEvents.USER_STAKE_LEVEL_UPDATED, this.updateChips.bind(this), this);
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }

    setNeedResetCurrentChip(status: boolean) {
        this.needResetCurrentChip = status;
    }

    setDisabledBetChips(status: boolean) {
        this.disabledBetChips = status;
    }

    setLeftButtonStatus(status) {
        this.leftButton.active = status && !this.disabledBetChips;
    }

    setRightButtonStatus(status) {
        this.rightButton.active = status && !this.disabledBetChips;
    }

    setChipValues(gameConfigs: any) {
        if (gameConfigs.chips.length === 0) {
            return;
        }
        this.gameConfigs = gameConfigs;
        this.configValues = gameConfigs.chips;
        this.updateChips();
    }

    updateChips() {
        this.chipValues = GameUtils.getFilterValuesByStakeLevel(this.configValues, this.gameConfigs);
        this.createChips();

        const currentBet =
            this.chipValues.findIndex((value) => parseInt(value.toString()) === parseInt(this.currentBetValue)) !== -1
                ? this.currentBetValue
                : this.chipValues[0] && this.chipValues[0].toString();
        if (currentBet === undefined) {
            return;
        }
        const needResetScrollOffset = currentBet !== this.currentBetValue;
        this.setCurrentBet(currentBet);
        this.snappedScrollView.initCalculatedPercent();
        if (needResetScrollOffset) {
            this.snappedScrollView.scroll.scrollToPercentHorizontal(0, 0.1);
        }
    }

    createChips() {
        this.chipList.forEach((chip) => chip.destroy());
        this.chips.removeAllChildren(true);
        this.chipList = [];
        this.chipValues.forEach((value) => {
            const node = this.createChipNode(value);
            this.chips.addChild(node);
            node.on("click", this.onClickBet.bind(this));
            this.chipList.push(node);
        });

        const layout = this.chips.getComponent(cc.Layout);
        layout.enabled = true;
        layout.updateLayout();
        layout.enabled = false;
    }

    createChipNode(value: number): cc.Node {
        return this.createBigChip(value);
    }

    getChipDisplayType(index: number) {
        return index > this.chipValues.length - 3 ? ChipDisplayType.VIP : ChipDisplayType.Normal;
    }

    updateLastChip(value: number) {
        const chipView = this.chipList[this.chipList.length - 1].getComponent(ChipView);
        this.updateChipView(chipView, value);
    }

    updateChipView(chipView: ChipView, value: number) {
        chipView.setValue(value);
        chipView.setColor(this.chipConfig.getChipColor(value));
    }

    onEnable() {
        this.resetCurrentChip();
    }

    resetCurrentChip() {
        if (!this.needResetCurrentChip) {
            return;
        }
        this.selectedIndex = 0;
        this.snappedScrollView.scrollTo(0);
        this.scrollToSelectedIndex();
    }

    public init(onChanged: OnChangedBet) {
        this.onChanged = onChanged;
    }

    public onPrevious() {
        AudioManager.getInstance().playClick();
        this.selectedIndex -= this.movingStep;
        this.scrollToSelectedIndex();
    }

    public onNext() {
        AudioManager.getInstance().playClick();
        this.selectedIndex += this.movingStep;
        this.scrollToSelectedIndex();
    }

    private updateArrowVisibility() {
        this.setLeftButtonStatus(true);
        this.setRightButtonStatus(true);

        if (this.selectedIndex <= 0) {
            this.selectedIndex = 0;
            this.setLeftButtonStatus(false);
        } else if (this.selectedIndex >= this.chipList.length - 1) {
            this.selectedIndex = this.chipList.length - 1;
            this.setRightButtonStatus(false);
        }
    }

    private scrollToSelectedIndex() {
        this.updateArrowVisibility();

        const min = this.snappedScrollView.getMinDisplayIndex();
        if (this.selectedIndex <= min) {
            this.snappedScrollView.scrollTo(this.selectedIndex);
        } else if (this.selectedIndex >= min + this.displaySize - 1) {
            this.snappedScrollView.scrollTo(this.selectedIndex - this.displaySize + 2);
        }
        this.updateSelectedChipValue();
    }

    public onClickBet(target) {
        const bet = target.node.name;
        AudioManager.getInstance().playSFX(this.betChipClickAudio.clip);
        this.setSelectedIndexAndScroll(bet);

        this.onClickBetCallback();
    }

    setSelectedIndexAndScroll(bet: string) {
        let i = 0;
        for (; i < this.chipList.length; i++) {
            if (this.chipList[i].name === bet) {
                break;
            }
        }
        this.selectedIndex = i;
        this.scrollToSelectedIndex();
    }

    public getCurrentBet(): string {
        return this.currentBetValue;
    }

    public setCurrentBet(bet: string) {
        this.currentBetValue = bet;
        this.updateSelectedBet(bet);
        this.onChanged(bet);
    }

    public moveChips(chipsBox: cc.Node, destBox: cc.Node) {
        const destBoxPosition = destBox.parent.convertToWorldSpaceAR(destBox.position);
        const destBoxInChipBoxSpacePosition = chipsBox.convertToNodeSpaceAR(destBoxPosition);

        _.forEach(chipsBox.children, (chip) => {
            this.moveChipThenDestroy(chip, destBoxInChipBoxSpacePosition, this.chipFlyingTime);
        });
    }

    public moveChipsWithRandomAmount(chipsBox: cc.Node, destBox: cc.Node, flyTime: number) {
        const randomAmount = 3;
        const destBoxPosition = destBox.parent.convertToWorldSpaceAR(destBox.position);
        const cloneChipsBox = cc.instantiate(chipsBox);
        cloneChipsBox.destroyAllChildren();
        chipsBox.parent.addChild(cloneChipsBox);

        const destBoxInChipBoxSpacePosition = cloneChipsBox.convertToNodeSpaceAR(destBoxPosition);
        const chipsCount = _.round(_.random(1, randomAmount));

        for (let i = 0; i < chipsCount; i++) {
            const chip = chipsBox.children[i];

            if (chip) {
                const cloneChip = cc.instantiate(chip);
                cloneChipsBox.addChild(cloneChip);
                this.moveChipThenDestroy(cloneChip, destBoxInChipBoxSpacePosition, flyTime);
            }
        }

        this.node.runAction(
            cc.sequence(
                cc.delayTime(flyTime * 1.5),
                cc.callFunc(() => cloneChipsBox.destroy())
            )
        );
    }

    public payChipsToWinningBetItem(chipBox: cc.Node, dealerBox: cc.Node) {
        const dealerBoxPosition = dealerBox.parent.convertToWorldSpaceAR(dealerBox.position);
        const dealerBoxInChipBoxSpacePosition = chipBox.convertToNodeSpaceAR(dealerBoxPosition);

        _.forEach(chipBox.children, (chip) => {
            const cloneChip = cc.instantiate(chip);
            cloneChip.position = dealerBoxInChipBoxSpacePosition;
            chipBox.addChild(cloneChip);
            const randomPosition = this.getRandomPositionChip(cloneChip, chipBox);
            cloneChip.runAction(this.moveChipTo(randomPosition, this.chipFlyingTime));
        });
    }

    public throwChipToChipBox(bet: number, chipBoxNode: cc.Node, startNode: cc.Node, onComplete: () => void) {
        const isLoginUserPlaceBet = startNode === null;

        const flyingDuration = isLoginUserPlaceBet ? this.loginUserChipFlyingTime : this.chipFlyingTime;
        this.checkPlaySoundPlaceBetForLoginUser(isLoginUserPlaceBet);
        const info = this.createStartNodeInfo(startNode, bet);
        const notNullStartNode = info.node;
        const startWPos = info.worldPos;
        const startPosition = notNullStartNode.convertToNodeSpaceAR(startWPos);

        const chipNode = this.createSmallChip(bet);
        chipNode.position = startPosition;
        const randomInChipBoxPosition = this.getRandomPositionChip(chipNode, chipBoxNode);
        const destWPos = chipBoxNode.convertToWorldSpaceAR(randomInChipBoxPosition);
        const randomPosition = notNullStartNode.convertToNodeSpaceAR(destWPos);
        notNullStartNode.addChild(chipNode);

        const onEnded = () => {
            if (!chipBoxNode || !chipBoxNode.isValid) {
                chipNode.destroy();
                return;
            }
            chipNode.parent = chipBoxNode;
            chipNode.position = randomInChipBoxPosition;

            if (onComplete) {
                onComplete();
            }
        };
        if (!chipNode.activeInHierarchy || !appManager.GAME_IS_SHOWED) {
            onEnded();
        } else {
            chipNode.runAction(
                cc.sequence(
                    this.moveChipTo(randomPosition, flyingDuration),
                    cc.callFunc(() => {
                        onEnded();
                    })
                )
            );
        }
    }

    public placeChipToChipBox(bet: number, destNode: cc.Node, startNode: cc.Node, onComplete: () => void) {
        const isLoginUserPlaceBet = startNode == null;
        const flyingDuration = isLoginUserPlaceBet ? this.loginUserChipFlyingTime : this.chipFlyingTime;
        this.checkPlaySoundPlaceBetForLoginUser(isLoginUserPlaceBet);
        const chipPosition = destNode.convertToNodeSpaceAR(this.createStartNodeInfo(startNode, bet).worldPos);
        const chipNode = this.createSmallChip(bet);
        chipNode.position = chipPosition;
        const randomPosition = this.getRandomPositionChip(chipNode, destNode);
        destNode.addChild(chipNode);

        if (!chipNode.activeInHierarchy) {
            chipNode.position = randomPosition;
        } else {
            chipNode.runAction(
                cc.sequence(
                    this.moveChipTo(randomPosition, flyingDuration),
                    cc.callFunc(() => {
                        if (onComplete) {
                            onComplete();
                        }
                    })
                )
            );
        }
    }

    public getChipNode(bet: number): cc.Node {
        return this.chips.children.find((child) => child.name === bet.toString());
    }

    private checkPlaySoundPlaceBetForLoginUser(isLoginUserPlaceBet: boolean) {
        if (isLoginUserPlaceBet) {
            this.playSingleChipsSound();
        }
    }
    private createStartNodeInfo(startNode: cc.Node, bet: number) {
        let worldPos: cc.Vec3;
        let node = startNode;
        if (startNode) {
            worldPos = startNode.parent.convertToWorldSpaceAR(startNode.position);
        } else {
            let chip = this.getChipNode(bet);
            if (!chip) {
                const chips = this.chips.children.filter((child) => +child.name < bet).sort((b, a) => +a.name - +b.name);
                chip = chips[0];
            }
            worldPos = chip.parent.convertToWorldSpaceAR(chip.position.add(cc.v3(0, chip.height / 2)));
            node = this.node;
        }

        return { node, worldPos };
    }

    public moveChipWithCallback({ chipNode, bet, destNode, startNode, onComplete, delayDestroy, duration, fadeDuration }) {
        this.checkPlaySoundPlaceBetForLoginUser(startNode === null);
        const chipPosition = destNode.convertToNodeSpaceAR(this.createStartNodeInfo(startNode, bet).worldPos);
        chipNode.position = chipPosition;
        destNode.addChild(chipNode);

        chipNode.runAction(
            cc.sequence(
                this.moveChipTo(cc.v3(0, 0), duration),
                cc.delayTime(delayDestroy),
                cc.callFunc(() => {
                    chipNode.runAction(cc.sequence(cc.fadeOut(fadeDuration), cc.removeSelf(true)));
                    onComplete();
                })
            )
        );
    }

    public addChips(chipsData: any, chipsBox: cc.Node) {
        if (!chipsData) {
            return;
        }

        this.addChipsByChipsData(chipsData, chipsBox);
    }

    private addChipsByChipsData(chipsData: any, chipsBox: cc.Node) {
        Object.keys(chipsData).forEach((chipValue) => {
            const count = chipsData[chipValue];
            for (let i = 0; i < count; i++) {
                const chip = this.createSmallChip(+chipValue);
                chip.position = this.getRandomPositionChip(chip, chipsBox);
                chipsBox.addChild(chip);
            }
        });
    }

    public addChipsToChipBox(rate: number, chipsData: any, chipsBox: cc.Node) {
        if (!chipsData) {
            return;
        }

        const chipValues = Object.keys(chipsData);
        _.forEach(chipValues, (originalChipValue) => {
            const chipCountOfBet = chipsData[originalChipValue];
            const convertChip = GameUtils.getValueByCurrency(+originalChipValue, rate);
            const convertValues = GameUtils.getChipQuantity(convertChip, this.chipValues);
            for (let i = 0; i < chipCountOfBet; i++) {
                this.addChipsByChipsData(convertValues, chipsBox);
            }
        });
    }

    public playSingleChipsSound() {
        AudioManager.getInstance().playSFX(this.singleChipAudio.clip);
    }

    private moveChipThenDestroy(chip: cc.Node, destBoxInChipBoxSpacePosition: cc.Vec3, flyTime: number) {
        cc.tween(chip)
            .then(this.moveChipTo(destBoxInChipBoxSpacePosition, flyTime))
            .delay(0.5 * flyTime)
            .call(() => chip.destroy())
            .start();
    }

    private moveChipTo(position: cc.Vec3, time: number): cc.ActionInterval {
        return cc.moveTo(time, cc.v2(position.x, position.y)).easing(cc.easeSineOut());
    }

    public getRandomPositionChip(chip: cc.Node, box: cc.Node): cc.Vec3 {
        const chipBoundingBox = chip.getBoundingBox();
        const xDest = _.random(Math.floor(chip.width / 4), Math.floor(box.width - chipBoundingBox.width / 2) + 1);
        const yDest = _.random(Math.floor(chip.height / 4), Math.floor(box.height - chipBoundingBox.height / 2) + 1);
        return cc.v3(xDest, yDest);
    }

    public throwChipThenConvertToStack(destNode: cc.Node, bet: number, onComplete: () => void) {
        const chip = this.createSmallChip(bet);
        const objectData = {
            chipNode: chip,
            bet,
            destNode,
            startNode: null,
            onComplete,
            delayDestroy: 0,
            duration: 0.3,
            fadeDuration: 1
        };
        this.moveChipWithCallback(objectData);
    }

    public createChipStackUtils(chipNode: cc.Node, amount: number) {
        chipNode.destroyAllChildren();
        const chipValues = GameUtils.getChipQuantity(amount, this.chipValues);
        const node = new cc.Node();
        node.scaleX = 0.3;
        node.scaleY = 0.3;
        const chipStack = node.addComponent(ChipStack);
        chipStack.chipSize = 26;
        chipStack.thickness = 18;
        chipStack.skewX = chipNode.skewX;

        const keys = Object.keys(chipValues).sort((a, b) => +b - +a);
        let firstChip = true;
        keys.forEach((chip) => {
            const count = chipValues[chip];
            for (let i = 0; i < count; i++) {
                let chipNode: cc.Node;
                if (+chip === 0) {
                    chipNode = this.createLowValueChip();
                } else {
                    chipNode = this.createBigChip(+chip);
                }
                chipStack.addChip(chipNode);
            }
        });
        chipNode.addChild(node);
    }

    public createChipStack(bet: number, options: number[]) {
        const values = GameUtils.getChipValues(bet, options);
        const node = new cc.Node();
        const layoutNode = new cc.Node();
        layoutNode.y = -13; //half size chip
        node.addChild(layoutNode);
        layoutNode.anchorY = 0;
        const layout = layoutNode.addComponent(cc.Layout);
        layout.type = cc.Layout.Type.VERTICAL;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layout.verticalDirection = cc.Layout.VerticalDirection.BOTTOM_TO_TOP;
        layout.spacingY = -22;
        const keys = Object.keys(values).sort((a, b) => +b - +a);
        keys.forEach((chip) => {
            const count = values[chip];
            for (let i = 0; i < count; i++) {
                const chipNode = this.createSmallChip(+chip);
                layoutNode.addChild(chipNode);
            }
        });

        return node;
    }

    public createChipFly(value: number) {
        return new cc.Node();
    }

    public createSmallChip(bet: number, scale = 0.29, showValue = false): cc.Node {
        if (bet === 0) {
            const node = this.createLowValueChip();
            node.rotation = _.random(0, 360);
            node.scale = this.smallChipScale;
            return node;
        }
        const chip = this.createBigChip(bet);
        const chipView = chip.getComponent(ChipView);
        chipView.applyForSmallChip(showValue);
        chip.scale = scale;
        chip.group = "Chip";
        return chip;
    }

    public createLowValueChip() {
        const node = new cc.Node();
        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;
        sprite.spriteFrame = this.lowValueChipSprite;
        this.setSizeLowValueChip(node);

        return node;
    }

    protected setSizeLowValueChip(node: cc.Node) {
        // set empty
    }

    public createBigChip(value: number): cc.Node {
        const chip = cc.instantiate(this.chipPrefab);
        const chipView = chip.getComponent(ChipView);
        chipView.setColor(this.chipConfig.getChipColor(value));
        chipView.setValue(value);
        const index = this.chipValues.findIndex((chipValue) => chipValue === value);
        chipView.setType(this.getChipDisplayType(index));
        return chip;
    }

    clearAllHighlight() {
        this.chips.children.forEach((chip) => {
            chip.stopAllActions();
            this.highlightChip(chip, false);
        });
    }

    highlightChip(chip: cc.Node, highlight: boolean) {
        const activeNode = chip.getChildByName("active");
        activeNode.active = highlight;
        chip.zIndex = highlight ? 2 : 1;
        const scaleChip = highlight ? 1.15 : 1;
        const posY = highlight ? 12 : 0;
        cc.tween(chip)
            .to(0.2, {
                scale: scaleChip,
                position: cc.v2(chip.position.x, posY)
            })
            .start();
    }

    updateSelectedBet(targetName: string) {
        this.chips.children.forEach((chip) => {
            chip.stopAllActions();
            const highlight = chip.name === targetName;
            this.highlightChip(chip, highlight);
        });
    }

    updateSelectedChipValue() {
        if (this.chipList.length === 0) {
            return;
        }
        const item = this.chipList[this.selectedIndex].name;
        if (item) {
            this.setCurrentBet(item);
        }
    }
    private createChipNodes(bet: number): cc.Node[] {
        const nodes = [];
        const values = GameUtils.getChipQuantity(bet, this.chipValues);
        const keys = Object.keys(values).sort((a, b) => +b - +a);
        keys.forEach((chip) => {
            const count = values[chip];
            for (let i = 0; i < count; i++) {
                const chipNode = this.createSmallChip(+chip);
                nodes.push(chipNode);
            }
        });

        return nodes;
    }

    public showChipOwnBet(item: { chipNode: cc.Node; clearChips: () => void }, bet: number) {
        item.clearChips();
        const nodes = this.createChipNodes(bet);
        nodes.forEach((node) => {
            const randomPosition = this.getRandomPositionChip(node, item.chipNode);
            node.position = randomPosition;
            item.chipNode.addChild(node);
        });
    }

    public payChipsToWinningBetItemWithAmount(chipBox: cc.Node, dealerBox: cc.Node, amount: number) {
        const dealerBoxPosition = dealerBox.parent.convertToWorldSpaceAR(dealerBox.position);
        const dealerBoxInChipBoxSpacePosition = chipBox.convertToNodeSpaceAR(dealerBoxPosition);

        const chipNodes = this.createChipNodes(amount);
        chipNodes.forEach((node) => {
            node.position = dealerBoxInChipBoxSpacePosition;
            chipBox.addChild(node);
            const randomPosition = this.getRandomPositionChip(node, chipBox);
            node.runAction(this.moveChipTo(randomPosition, this.chipFlyingTime));
        });
    }
}

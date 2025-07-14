import { lodash } from "../../../ClientModules";
import BetChipsNew from "../../../common/bet-chips/view-models/BetChipsNew";
import ChipConfig from "../../../common/bet-chips/view-models/ChipConfig";
import { chipFlyConfig, ChipParams } from "../../../common/bet-chips/view-models/ChipFlyConfig";
import ChipView from "../../../common/bet-chips/view-models/ChipView";
import ChipViewNew from "../../../common/bet-chips/view-models/ChipViewNew";
import GameUtils from "../../../common/GameUtils";
import WebSocketTableGameBase from "../../_base/WebSocketTableGameBase";
import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";
import HoldemPoker from "./HoldemPoker";
import HoldemPokerBettingArea from "./HoldemPokerBettingArea";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HoldemPokerChips extends cc.Component {
    updateChipStackTween: cc.Tween;
    winningEffect: cc.Node;
    chipThick = 10;

    public createChip(betChips: BetChipsNew, amount: number): cc.Node {
        return betChips.createChipFly(amount);
    }

    public get chipConfig() {
        return ChipConfig.getInstance();
    }

    convertChips(betAmount, chipValues) {
        return GameUtils.getChipQuantity(betAmount, chipValues);
    }

    public static addShadowFrameStack(firstChip: boolean, shadowFrame: cc.SpriteFrame, chipNode: cc.Node, index: number) {
        if (firstChip && index === 0) {
            firstChip = false;
            const shadow = new cc.Node();
            shadow.addComponent(cc.Sprite).spriteFrame = shadowFrame;
            chipNode.addChild(shadow);
        }
        return { chip: chipNode, isFirstChip: firstChip };
    }

    public static shakeChipAnim(propertiesChip: ChipViewNew, chipFly: any) {
        cc.tween(propertiesChip)

            .to(0.2, {
                rotation: chipFly.rotationComp2,
                scaleX: chipFly.scaleX1,
                scaleY: chipFly.scaleY1,
                rotationNode: chipFly.rotationNode1
            })
            .to(0.2, { rotationNode: chipFly.rotationNode3, scaleX: chipFly.scaleX2, scaleY: chipFly.scaleY2 })
            //.to(0.1, { rotationNode: chipFly.rotationNode3 })

            .to(0.05, { skewY: -5 })
            .to(0.1, { skewY: 5 })
            .to(0.05, { skewY: 0 })
            .start();
    }

    public static createChipStackUtils(bet: number, betChips: BetChipsNew, shadowFrame: cc.SpriteFrame, skewX: number, isChip3D: boolean) {
        return GameUtils.createChipStack(bet, betChips, { isChip3D: isChip3D, shadowFrame: shadowFrame, skewX: skewX });
    }

    createChipStack(betAmount: number, node: cc.Node, betChips: BetChipsNew, shadowFrame: cc.SpriteFrame) {
        const chipStack = HoldemPokerChips.createChipStackUtils(betAmount, betChips, shadowFrame, node.skewX, true);
        node.addChild(chipStack);
        return chipStack;
    }

    public flyChipToBetPlace(betChips: BetChipsNew, destNode: cc.Node, betAmount: number, totalAmount: number) {
        if (!betAmount) {
            return;
        }
        const chipFly = chipFlyConfig;

        const chipNode = betChips.createChipFly(betAmount);
        const propertiesChip = chipNode.getComponent(ChipViewNew);
        let nodeTmp: cc.Node;

        if (destNode.childrenCount === 0) {
            nodeTmp = new cc.Node();
            destNode.addChild(nodeTmp);
        } else {
            nodeTmp = destNode.children[0];
        }
        const startNode = betChips.getChipNode(betAmount) || betChips.node;
        chipNode.position = destNode.convertToNodeSpaceAR(startNode.convertToWorldSpaceAR(cc.v3(0, 0)));

        nodeTmp.addChild(chipNode);

        let destPosition = cc.v2(0, 0);

        if (nodeTmp.childrenCount === 1) {
            propertiesChip.firstChipShadow.active = true;
        }

        if (nodeTmp.childrenCount > 1) {
            const destY = (nodeTmp.childrenCount - 1) * (ChipParams.offset + ChipParams.offsetStack);
            destPosition = cc.v2(lodash.random(-2, 2), destY);
        }

        const jumpChipDuration = 0.5;

        chipNode.runAction(cc.jumpTo(jumpChipDuration, destPosition.x, destPosition.y, 150, 1));
        this?.updateChipStackTween?.stop();
        this.updateChipStackTween = cc
            .tween(chipNode)
            .delay(jumpChipDuration)
            .call(() => {
                const stackObj = GameUtils.isChipStack(totalAmount, betChips, nodeTmp);

                if (stackObj.isStack) {
                    this.generateStackChips(stackObj, nodeTmp);
                }
            })
            .start();
        HoldemPokerChips.shakeChipAnim(propertiesChip, chipFly);
    }

    private generateStackChips(stackObj: { isStack: boolean; chipValues: any; chipTotal: number }, nodeTmp: cc.Node) {
        const chipTotal = stackObj.chipTotal;
        const nodeArr = [];
        const values = stackObj.chipValues;
        const keys = Object.keys(values).sort((a, b) => +b - +a);
        keys.forEach((chip) => {
            const count = values[chip];
            for (let i = 0; i < count; i++) {
                nodeArr.push(chip);
            }
        });
        for (let i = 0; i < nodeTmp.childrenCount; i++) {
            const chipCurr = nodeTmp.children[i];
            if (i < chipTotal) {
                const chipView = chipCurr.getComponent(ChipView);
                chipView?.setColor(this.chipConfig.getChipColor(nodeArr[i]));
                chipView?.setValue(nodeArr[i]);
            } else {
                chipCurr.destroy();
            }
        }
    }

    public showWinningOption(
        gameData: HoldemPokerGameData,
        bettingAreas: HoldemPokerBettingArea[],
        betChips: BetChipsNew,
        main: HoldemPoker,
        choicesConst: any,
        shadowFrame: cc.SpriteFrame
    ) {
        const winningHands = gameData.finishModel.settlementResult;
        let totalWin = 0;
        let totalBet = 0;

        for (const [key, value] of Object.entries(winningHands)) {
            const betAmount = gameData.placeBetModel.choices[choicesConst[key]] ?? 0;
            totalBet += betAmount;
            const bettingArea = bettingAreas.filter((a) => a.betChoice === key)[0];
            const jumpTime = 0.65;
            const delayBeforeFly = 0.1;
            if (value > 0) {
                totalWin += +value;

                if (+value > betAmount) {
                    const winAmount = value - betAmount;
                    const destNode = bettingArea.chipNode;
                    this.handleChipStack(main, destNode, betChips, value, winAmount, shadowFrame);
                    bettingArea.handleWinningAmount(value, true);
                    main.playStartGameAudio();
                }
            } else {
                const bettingArea = bettingAreas.filter((a) => a.betChoice === key)[0];
                this.flyChipToDealer(bettingArea, main.dealerChipTray, jumpTime, delayBeforeFly);
                main.playStartGameAudio();
            }
        }

        this.playerWinningAffectAction(totalWin, totalBet, gameData, main);
        main.getConfigs();
    }

    private handleChipStack(
        main: HoldemPoker,
        destNode: cc.Node,
        betChips: BetChipsNew,
        value: number,
        winAmount: number,
        shadowFrame: cc.SpriteFrame
    ) {
        const timeMoving = 600;
        const chipStack = this.createChipStack(winAmount, destNode, betChips, shadowFrame);

        const startPos = chipStack.parent.convertToNodeSpaceAR(main.dealerChipTray.convertToWorldSpaceAR(cc.v2(0, 0)));
        const betAmount = value - winAmount;
        const betAmountChip = GameUtils.getChipQuantity(betAmount, betChips.chipValues);
        const keys = Object.keys(betAmountChip).sort((a, b) => +b - +a);
        const totalChipCount = keys.reduce((sum, chip) => sum + betAmountChip[chip], 0);
        const offset = ChipParams.offset;
        const offsetStack = ChipParams.offsetStack;
        const chipStackChildren = chipStack.children;

        let delayTime = 0;

        chipStack.position = cc.v3(startPos.x, startPos.y, 0);

        chipStackChildren.forEach((chip, index) => {
            const currentChipStackPosition = (totalChipCount + index) * (offset + offsetStack);
            const desPost = chip.parent.convertToNodeSpaceAR(destNode.convertToWorldSpaceAR(cc.v2(0, 0)));
            const desPostX = desPost.x + lodash.random(-2, 2);
            const desPostY = desPost.y + currentChipStackPosition;

            chip.scale = 0.5;
            chip.opacity = 0;

            if (index === 0) {
                chip.active = false;
            }

            delayTime = index * 200;

            this.scheduleOnce(() => {
                chip.runAction(
                    cc.sequence(
                        cc.spawn(cc.jumpTo(0.6, desPostX, desPostY, 200, 1), cc.scaleTo(0.6, 1), cc.fadeTo(0.1, 255)),
                        cc.delayTime(1)
                    )
                );
            }, delayTime / 1000);
        });

        this.scheduleOnce(() => {
            destNode?.destroyAllChildren();
            this.createChipStack(value, destNode, betChips, shadowFrame);
        }, (delayTime + timeMoving) / 1000);
    }
    private playerWinningAffectAction(totalWin: number, totalBet: number, gameData: HoldemPokerGameData, main: HoldemPoker) {
        const isWin = totalWin > totalBet;
        totalWin > 0 && main.showWinningBet(totalWin);
        isWin && this.playWinningEffect(main, main.userProfile.node, 5);
        main.updateUserBalance();
        main.pokerCardScript.unFocusPlayerCard();
        gameData.finishModel.finishAnimationWinning();
    }

    private flyChipToDealer(bettingArea: HoldemPokerBettingArea, dealerLocation: cc.Node, jumpTime: number, delayBeforeFly: number) {
        const clonedChip = cc.instantiate(bettingArea.chipNode);
        bettingArea.node.addChild(clonedChip);
        clonedChip.position = cc.v3(0, 0, 0);
        bettingArea.chipNode.destroyAllChildren();
        const destPos = clonedChip.parent.convertToNodeSpaceAR(dealerLocation.convertToWorldSpaceAR(cc.v2(0, 0)));
        clonedChip.runAction(
            cc.sequence(
                cc.spawn(cc.jumpTo(jumpTime, destPos, 150, 1), cc.scaleTo(0.8, 0.5)),
                cc.delayTime(delayBeforeFly),
                cc.fadeOut(0.3),
                cc.callFunc(() => {
                    clonedChip.destroy();
                })
            )
        );
    }

    playWinningEffect(mainRoomGame: WebSocketTableGameBase, playerNode: cc.Node, duration = 5.4) {
        this.winningEffect = cc.instantiate(mainRoomGame.winningPlayerEffectPrefab);
        playerNode.addChild(this.winningEffect);
        const animation = this.winningEffect.getComponent(cc.Animation);

        this.winningEffect.runAction(
            cc.sequence(
                cc.callFunc(() => {
                    animation.play();
                }),
                cc.delayTime(duration),
                cc.callFunc(() => {
                    this.stopWinningEffect();
                })
            )
        );
    }

    stopWinningEffect() {
        if (this.winningEffect && this.winningEffect.isValid) {
            this.winningEffect.destroy();
        }
    }
}

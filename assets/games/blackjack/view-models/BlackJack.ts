import * as i18n from "i18n/runtime-scripts/LanguageData";

import { lazyInject } from "../../../Application";
import { lodash } from "../../../ClientModules";
import GameUtils from "../../../common/GameUtils";
import AnimatedTime from "../../../common/animated-time/view-models/AnimatedTime";
import AudioManager from "../../../common/audio/AudioManager";
import BetChipsNew from "../../../common/bet-chips/view-models/BetChipsNew";
import ChipConfig from "../../../common/bet-chips/view-models/ChipConfig";
import { ChipParams, chipFlyConfig } from "../../../common/bet-chips/view-models/ChipFlyConfig";
import ChipView from "../../../common/bet-chips/view-models/ChipView";
import ChipViewNew from "../../../common/bet-chips/view-models/ChipViewNew";
import ChipStack from "../../../common/chip-stack/views/ChipStack";
import FadeEffectButton from "../../../common/custom-button/FadeEffectButton";
import NewButton from "../../../common/custom-button/NewButton";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import NewCard, { CardAnimation, CardModel } from "../../../common/new-card/view-models/NewCard";
import { userManager } from "../../../common/user/UserManager";
import { GameState } from "../../_base/GameState";
import SocketIOTableGameBase from "../../_base/SocketIOTableGameBase";
import DataHandler from "../../_base/handlers/DataHandler";
import GameBaseConfigsHandler from "../../_base/handlers/GameBaseConfigsHandler";
import GameBaseErrorHandler from "../../_base/handlers/GameBaseErrorHandler";
import GameBaseNoticeHandler from "../../_base/handlers/GameBaseNoticeHandler";
import GameBaseProvablyFairHandler from "../../_base/handlers/GameBaseProvablyFairHandler";
import GameBaseUmDataHandler from "../../_base/handlers/GameBaseUmDataHandler";
import GameBaseVoidTicketHandler from "../../_base/handlers/GameBaseVoidTicketHandler";
import RoomPlayer from "../../_base/view-models/RoomPlayer";
import BlackJackConfig from "./BlackJackConfig";
import BlackJackHistory from "./BlackJackHistory";
import BlackJackUtils from "./BlackJackUtils";
import HandPlace from "./HandPlace";
import BlackJackBetHandler from "./handlers/BlackJackBetHandler";
import BlackJackFinishHandler from "./handlers/BlackJackFinishHandler";
import BlackJackIngameHandler from "./handlers/BlackJackIngameHandler";
import DealHandler from "./handlers/DealHandler";
import IngameActionHandler from "./handlers/IngameActionHandler";

const { ccclass, property } = cc._decorator;

export const BlackJackId = 23;

export enum BlackJackActionType {
    START_ROUND = 0,
    IN_ROUND,
    END_ROUND,
    ERROR
}
@ccclass
export default class BlackJack extends SocketIOTableGameBase {
    @property({ type: cc.Node, visible: false, override: true })
    timeWaitNode: cc.Node = null;

    @property({ type: cc.Label, visible: false, override: true })
    timeWaitLabel: cc.Label = null;

    @property({ type: AnimatedTime, visible: false, override: true })
    animatedTime: AnimatedTime = null;

    @property({ type: cc.Label, visible: false, override: true })
    gameRound: cc.Label = null;

    @property({ type: RoomPlayer, visible: false, override: true })
    players: RoomPlayer[] = [];

    @property({ type: cc.Node, visible: false, override: true })
    otherPlayers: cc.Node = null;

    @property({ type: HandPlace })
    handPlaces: HandPlace[] = [];

    @property(HandPlace)
    dealerHand: HandPlace = null;

    @property({ type: cc.Node })
    chipContainers: cc.Node[] = [];

    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null;

    @property(cc.Node)
    cardBox: cc.Node = null;

    @property(cc.Node)
    cardDropPlace: cc.Node = null;

    @property(cc.Node)
    dealerChipTray: cc.Node = null;

    @property(cc.Node)
    splitButton: cc.Node = null;

    @property(cc.Node)
    doubleButton: cc.Node = null;

    @property(cc.Node)
    standButton: cc.Node = null;

    @property(cc.Node)
    hitButton: cc.Node = null;

    @property(cc.Node)
    newBetButton: cc.Node = null;

    @property(cc.Node)
    rebetAndDealButton: cc.Node = null;

    @property(cc.Node)
    clearButton: cc.Node = null;

    @property(cc.Node)
    dealButton: cc.Node = null;

    @property(cc.Label)
    totalBetLabel: cc.Label = null;

    @property(cc.Label)
    minBetLabel: cc.Label = null;

    @property(cc.Label)
    maxBetLabel: cc.Label = null;

    @property(cc.Label)
    blackjackOddLabel: cc.Label = null;

    @property(cc.Prefab)
    blackjackHistory: cc.Prefab = null;

    @property(cc.SpriteFrame)
    shadowChip: cc.SpriteFrame = null;

    @property(cc.AudioSource)
    cardSlideAudioSource: cc.AudioSource = null;

    @property(cc.AudioSource)
    gameNotificationsAudio: cc.AudioSource = null;

    @property(cc.AudioSource)
    singleChipAudio: cc.AudioSource = null;

    @property(cc.Node)
    bottomBetChipsPos: cc.Node = null;

    @lazyInject(BlackJackConfig)
    private readonly blackJackConfig: BlackJackConfig;

    finishHandler: BlackJackFinishHandler;
    dealHander: DataHandler;
    ingameActionHander: DataHandler;
    ingameHander: DataHandler;
    activeHand: HandPlace = null;
    lastHandBets: any[] = [];
    audioNotificationInterval: any;
    betChips: BetChipsNew;

    public configDuration = {
        drawingCardDelay: 0.7,
        delaySwitchHand: 1
    };
    public gameStatus: BlackJackActionType;
    private readonly priorityHands = [];
    private roundFinished = false;
    private betChipsPostion;
    protected moveCardDuration = 0.45;
    protected chipJumpHeight = 150;

    constructor() {
        super();
        this.gameId = BlackJackId;
    }

    onLoad() {
        super.onLoad();
        this.betChipsPostion = this.betChipsContainer.parent.position;
        this.initHandPlaces();
        this.hideAllButtons();
        this.totalBetLabel.string = "";
        this.setGameRoundStatus(BlackJackActionType.START_ROUND);
        this.setupButtonCallbacks();
    }

    setupButtonCallbacks() {
        this.splitButton && (this.splitButton.getComponent(NewButton).callback.selected = () => this.onSplitClick());
        this.doubleButton && (this.doubleButton.getComponent(NewButton).callback.selected = () => this.onDoubleClick());
        this.standButton && (this.standButton.getComponent(NewButton).callback.selected = () => this.onStandClick());
        this.hitButton && (this.hitButton.getComponent(NewButton).callback.selected = () => this.onHitClick());
        this.newBetButton && (this.newBetButton.getComponent(NewButton).callback.selected = () => this.onNewBetClick());
        this.rebetAndDealButton && (this.rebetAndDealButton.getComponent(NewButton).callback.selected = () => this.onRebetClick());
        this.clearButton && (this.clearButton.getComponent(NewButton).callback.selected = () => this.onClearClick());
        this.dealButton && (this.dealButton.getComponent(NewButton).callback.selected = () => this.onDealClick());
    }

    onDestroy() {
        super.onDestroy();
        this.stopIntervalReminder();
    }

    override stopGame() {
        // handle
    }

    disableGame() {
        this.gameState = GameState.Disabled;
    }

    setGameRoundStatus(status: number) {
        this.gameStatus = status;
    }

    protected onGameHide() {
        // handle
        this.isGameHide = true;
    }

    checkShowUmMessage(data: any) {
        return true;
    }

    setUpHandlers() {
        this.umHandler = new GameBaseUmDataHandler(this);
        this.noticeHandler = new GameBaseNoticeHandler(this);
        this.errorHandler = new GameBaseErrorHandler(this);
        this.configsHandler = new GameBaseConfigsHandler(this);
        this.betHandler = new BlackJackBetHandler(this);
        this.voidTicketHandler = new GameBaseVoidTicketHandler(this);
        this.provablyFairHandler = new GameBaseProvablyFairHandler(this);

        this.setupSpecialHandler();

        this.addHandlers(
            this.umHandler,
            this.noticeHandler,
            this.betHandler,
            this.errorHandler,
            this.configsHandler,
            this.finishHandler,
            this.provablyFairHandler,
            this.dealHander,
            this.ingameActionHander,
            this.ingameHander,
            this.voidTicketHandler
        );
    }

    setupSpecialHandler() {
        this.dealHander = new DealHandler(this);
        this.ingameActionHander = new IngameActionHandler(this);
        this.finishHandler = new BlackJackFinishHandler(this);
        this.ingameHander = new BlackJackIngameHandler(this);
    }

    getCurrentTotalAmount(): number {
        let total = 0;
        this.handPlaces.forEach((place) => {
            total += place.getBetAmount();
        });
        return total;
    }

    updateTotalBetLabel() {
        const total = this.getCurrentTotalAmount();
        this.totalBetLabel.string = numberWithCommas(total);
    }

    public get chipConfig() {
        return ChipConfig.getInstance();
    }

    initHandPlaces() {
        this.handPlaces.forEach((handPlace, index) => {
            handPlace.betItemClickCallback = () => {
                if (this.waitingProcessing) {
                    return;
                }

                this.handPlaces.forEach((place) => place.highlightPlace(false));
                handPlace.highlightPlace(true);

                const maxBet = this.getMaxBet();
                if (handPlace.getBetAmount() + this.currentBet > maxBet) {
                    this.showMiniWarning(i18n.t("messages.maxStakeHand", { maxBet: numberWithCommas(maxBet) }));
                    return;
                }

                if (this.getCurrentTotalAmount() + this.currentBet > userManager.balance) {
                    this.showMiniWarning(i18n.t("messages.notEnoughMoney"));
                    return;
                }

                this.playSingleChipsSound();

                handPlace.showBetText(false);

                if (!this.priorityHands.includes(index)) {
                    this.priorityHands.push(index);
                }
                this.dealButton?.getComponent(FadeEffectButton).setActive();
                this.clearButton?.getComponent(FadeEffectButton).setActive();
                handPlace.addBetAmount(this.currentBet);
                const destNode = this.chipContainers[index];
                const startNode = this.betChips.getChipNode(this.currentBet);
                this.throwChipAnim(destNode, startNode, handPlace);
            };
            handPlace.clearBetClickCallback = (checkExistChip) => {
                handPlace.showBetText(true);
                this.chipContainers[index].destroyAllChildren();
                const location = this.priorityHands.indexOf(index);
                if (location > -1) {
                    this.priorityHands.splice(location, 1);
                }

                checkExistChip && this.checkExistChipOnTable();
            };
        });
    }

    private moveAndMergeChip(chipNode: cc.Node, chipFlyingDuration: number, destPosition: any, handPlace: HandPlace, nodeTmp: cc.Node) {
        chipNode.runAction(
            cc.sequence(
                cc.jumpTo(chipFlyingDuration, destPosition.x, destPosition.y, this.chipJumpHeight, 1),
                cc.delayTime(0.2),
                cc.callFunc(() => {
                    handPlace.updateDisplayBetValue();
                    this.gameStatus === BlackJackActionType.START_ROUND && (handPlace.clearBetButton.active = true);
                    this.updateTotalBetLabel();
                    const stackObj = GameUtils.isChipStack(handPlace.getBetAmount(), this.betChips, nodeTmp);

                    if (stackObj.isStack) {
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
                                chipView.setColor(this.chipConfig.getChipColor(nodeArr[i]));
                                chipView.setValue(nodeArr[i]);
                            } else {
                                chipCurr.destroy();
                            }
                        }
                    }
                })
            )
        );
    }

    throwChipAnim(destNode: cc.Node, startNode: cc.Node, handPlace: HandPlace) {
        const chipFlyingDuration = 0.5;
        const chipFly = chipFlyConfig;
        const chipNode = this.betChips.createChipFly(this.currentBet);
        const propertiesChip = chipNode.getComponent(ChipViewNew);
        let nodeTmp: cc.Node;
        if (destNode.childrenCount === 0) {
            nodeTmp = new cc.Node();
            destNode.addChild(nodeTmp);
        } else {
            nodeTmp = destNode.children[0];
        }

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
        this.moveAndMergeChip(chipNode, chipFlyingDuration, destPosition, handPlace, nodeTmp);
        BlackJackUtils.shakeChipAnim(propertiesChip, chipFly);
    }

    handleDestPosition(destNode: any, destPosition: any) {
        if (destNode.childrenCount > 0) {
            const stack = destNode.children[0].getComponent(ChipStack);
            if (stack) {
                destPosition = cc.v2(0, stack.getCurrentHeight());
            }
        }

        return destPosition;
    }

    checkExistChipOnTable() {
        const existChip = this.handPlaces.find((place) => place.getBetAmount() > 0) !== undefined;
        this.dealButton?.getComponent(FadeEffectButton).setActive(existChip);
        this.clearButton?.getComponent(FadeEffectButton).setActive(existChip);
        this.updateTotalBetLabel();
    }

    createCard(card: CardModel): cc.Node {
        const node = cc.instantiate(this.cardPrefab);
        const cardComponent = node.getComponent(NewCard);
        cardComponent.setCard(card);
        return node;
    }

    playAudioCardSliding() {
        AudioManager.getInstance().playSFX(this.cardSlideAudioSource.clip);
    }

    drawingCardToPlayer(
        card: CardModel,
        pos: number,
        isDrawFirstCard = false,
        onComplete = () => {
            //handle
        }
    ) {
        const cardNode = this.createCard(card);
        const handPlace = this.handPlaces[pos];

        const cardComponent = cardNode.getComponent(NewCard);
        const startWorldPos = this.cardBox.convertToWorldSpaceAR(cc.v2(0, 0));
        const startLocalPos = handPlace.cardLayout.content.convertToNodeSpaceAR(startWorldPos);
        const nextPosition = handPlace.cardLayout.getNextPosition(isDrawFirstCard);
        const finalPosition = handPlace.cardLayout.getFinalPosition(isDrawFirstCard);
        const rotationX = handPlace.selected ? this.dealerHand.cardLayout.selectedRotationX : 0;
        const scaleY = handPlace.selected ? 1.15 : 1;
        cardNode.position = cc.v3(startLocalPos.x, startLocalPos.y, 0);
        handPlace.addCard(cardNode);

        const pullDuration = 0.2;
        const slideDuration = 0.1;
        cardComponent.playAnimation(CardAnimation.PullCard, pullDuration);
        cc.tween(cardNode)
            .delay(pullDuration)
            .call(() => {
                this.playAudioCardSliding();
                cardComponent.playAnimation(CardAnimation.DealerToHand, this.moveCardDuration);
            })
            .to(this.moveCardDuration, { position: nextPosition, rotationX: rotationX, scaleY: scaleY }, { easing: "easeOut" })
            .to(slideDuration, { position: finalPosition, rotationX: rotationX, scaleY: scaleY }, { easing: "easeOut" })
            .call(() => {
                handPlace.cardLayout.updateLayout();
                onComplete?.();
            })
            .start();
    }

    drawingCardToDealer(
        card: CardModel,
        faceDown: boolean,
        onComplete = () => {
            //handle
        }
    ) {
        const cardNode = this.createCard(card);
        const cardComponent = cardNode.getComponent(NewCard);
        const startWorldPos = this.cardBox.convertToWorldSpaceAR(cc.v2(0, 0));
        const startLocalPos = this.dealerHand.cardLayout.content.convertToNodeSpaceAR(startWorldPos);
        const finalPosition = this.dealerHand.cardLayout.getFinalPosition();

        const rotationX = 0;
        cardNode.position = cc.v3(startLocalPos.x, startLocalPos.y, 0);
        this.dealerHand.addCard(cardNode);

        const pullDuration = 0.2;

        cardComponent.playAnimation(CardAnimation.PullCard, pullDuration);
        cc.tween(cardNode)
            .delay(pullDuration)
            .call(() => {
                this.playAudioCardSliding();
                cardComponent.playAnimation(
                    faceDown ? CardAnimation.DealerDrawingFaceDown : CardAnimation.DealerToHand,
                    this.moveCardDuration
                );
            })
            .to(this.moveCardDuration, { position: finalPosition, rotationX: rotationX }, { easing: "easeOut" })

            .call(() => {
                onComplete?.();
            })
            .start();
    }

    dealerOpenFirstCard(card: CardModel, duration: number) {
        // override
    }

    dealerOpenSecondCard(card: CardModel, duration: number) {
        this.dealerOpenCard(card, duration, 1);
    }

    dealerOpenCard(card: CardModel, duration: number, order: number) {
        const cardNode = this.dealerHand.getCards()[order];
        const cardComponent = cardNode.getComponent(NewCard);
        cardComponent.setCard(card);
        cardComponent.playAnimation(CardAnimation.DealerOpenCard, duration);
    }

    finishRound() {
        if (!this.roundFinished) {
            return;
        }
        const finishHandler = this.finishHandler;
        if (!finishHandler.finishDataCache) {
            return;
        }
        finishHandler.processFinish();
    }

    startRound() {
        this.switchToNextHand();
    }

    switchToNextHand() {
        const sortIndices = [0, 3, 1, 4, 2, 5];
        const places = sortIndices.map((i) => this.handPlaces[i]);
        const nextHand = places.find((hand) => hand.isActive && !hand.isStand);

        if (nextHand) {
            if (this.activeHand !== nextHand) {
                this.activeHand = nextHand;
            }

            nextHand.selected = true;
            this.showActionsWithBehavior(BlackJackActionType.IN_ROUND);
        } else {
            this.switchToDealer();
            this.inRoundActionVisibility(false);
        }

        this.updateAvailableActions();
    }

    switchToDealer() {
        this.roundFinished = true;
        this.finishRound();
    }

    canSendRequest(): boolean {
        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
            return false;
        } else {
            this.lockBet();
            return true;
        }
    }

    onDealClick() {
        AudioManager.getInstance().playClick();
        if (!this.canSendRequest()) {
            return;
        }

        this.handPlaces.forEach((place) => {
            place.showClearBetButton(false);
        });

        const hands = [];

        this.priorityHands.forEach((i) => {
            const betAmount = this.handPlaces[i].getBetAmount();
            if (betAmount > 0) {
                hands.push({ pos: i + 1, bet: betAmount });
            }
        });

        this.lastHandBets = hands;
        this.rebet();
    }

    socketSendData(key: string, data: any) {
        if (data) {
            data.username = userManager.userName;
            this.setIntervalReminder();
        }

        if (this.socket && this.socket.connected) {
            if (data) {
                this.socket.emit(key, data);
            } else {
                this.socket.emit(key);
            }
        }
    }

    rebet() {
        const data = {
            deal: {
                hands: this.lastHandBets
            }
        };
        this.sendBetData(data);
    }

    sendBetData(data) {
        data["clientSentTime"] = new Date();
        this.socketSendData("bet", data);
    }

    onSplitClick() {
        if (!this.canSendRequest()) {
            return;
        }

        const data = {
            split: {
                id: this.activeHand.idValue
            }
        };
        this.sendBetData(data);
    }

    onDoubleClick() {
        if (!this.canSendRequest()) {
            return;
        }

        const data = {
            double: {
                id: this.activeHand.idValue
            }
        };
        this.sendBetData(data);
    }

    onStandClick() {
        AudioManager.getInstance().playClick();
        if (!this.canSendRequest()) {
            return;
        }

        const data = {
            stand: {
                id: this.activeHand.idValue
            }
        };
        this.sendBetData(data);
    }

    onHitClick() {
        AudioManager.getInstance().playClick();
        if (!this.canSendRequest()) {
            return;
        }

        const data = {
            hit: {
                id: this.activeHand.idValue
            }
        };
        this.sendBetData(data);
    }

    onNewBetClick() {
        this.finishHandler.stopAllAnimations();
        this.finishHandler.removeAllSchedule();

        AudioManager.getInstance().playClick();
        this.collectCardsOnTable();
        this.slidingDownBetChip(false);
        this.chipContainers?.forEach((chipContainer) => {
            chipContainer?.destroyAllChildren();
        });
    }

    randomRotation(): number {
        return Math.floor(Math.random() * 10); // NOSONAR
    }

    collectCardsOnTable(
        complete = () => {
            // handle
        }
    ) {
        this.newGame();
        const worldPositon = this.cardDropPlace.convertToWorldSpaceAR(cc.v2(0, 0));
        const collectDuration = 0.65;

        let count = 0;
        const dealerCardsNodes = this.dealerHand.getCards();
        const destPosition = dealerCardsNodes[0].parent.convertToNodeSpaceAR(worldPositon);

        dealerCardsNodes.forEach((cardNode) => {
            cardNode.is3DNode = true;
            cc.tween(cardNode)
                .to(0.3, { position: cc.v3(0, 0, 0), eulerAngles: cc.v3(0, 0, this.randomRotation()) })
                .delay(count * 0.05)
                .call(() => {
                    const cardComponent = cardNode.getComponent(NewCard);
                    cardComponent.playAnimation(CardAnimation.DropCard, 0.7);
                })
                .then(cc.jumpTo(0.7, destPosition, 250, 1))
                .delay(0.2)
                .call(() => cardNode.destroy())
                .start();
        });
        count++;
        this.handPlaces.forEach((place) => {
            const cardNodes = place.getCards();
            if (cardNodes.length === 0) {
                return;
            }

            count++;
            const destPos = cardNodes[0].parent.convertToNodeSpaceAR(worldPositon);
            cardNodes.forEach((cardNode) => {
                cardNode.is3DNode = true;
                cc.tween(cardNode)
                    .to(0.3, { position: cc.v3(0, 0, 0), eulerAngles: cc.v3(0, 0, this.randomRotation()) })
                    .delay(count * 0.05)
                    .call(() => {
                        const cardComponent = cardNode.getComponent(NewCard);
                        cardComponent.playAnimation(CardAnimation.DropCard, collectDuration);
                    })
                    .to(collectDuration, { position: destPos })
                    .delay(collectDuration)
                    .call(() => cardNode.destroy())
                    .start();
            });
        });

        cc.tween(this.node)
            .delay(1)
            .call(() => complete())
            .start();

        this.setGameRoundStatus(BlackJackActionType.START_ROUND);
    }

    onRebetClick() {
        if (!this.canSendRequest()) {
            return;
        }
        this.finishHandler.stopAllAnimations();
        this.finishHandler.removeAllSchedule();

        this.collectCardsOnTable(() => {
            let total = 0;
            this.lastHandBets.forEach((hand) => (total += hand.bet));
            if (total > userManager.balance) {
                this.showMiniWarning(i18n.t("messages.notEnoughMoney"));
                this.slidingDownBetChip(false);
                this.showProcessingWarning(false);

                return;
            }
            //restore chip value
            this.lastHandBets.forEach((hand) => {
                this.playSingleChipsSound();
                this.chipContainers[hand.pos - 1].destroyAllChildren();
                this.createChipStack(hand.bet, this.chipContainers[hand.pos - 1]);
                const place = this.handPlaces[hand.pos - 1];
                place.updateDisplayBetValue(hand.bet);
                place.showBetText(false);
            });
            this.updateTotalBetLabel();
            this.rebet();
        });
    }

    createChipStack(betAmount: any, node: cc.Node) {
        const chipStack = BlackJackUtils.createChipStack(betAmount, this.betChips, this.shadowChip, node.skewX, true);
        node.addChild(chipStack);
        return chipStack;
    }

    onClearClick() {
        if (this.waitingProcessing) {
            return;
        }
        AudioManager.getInstance().playClick();
        this.handPlaces.forEach((place) => place.onClearBetClick());
        this.slidingDownBetChip(false);
    }

    openHistory() {
        const history = cc.instantiate(this.blackjackHistory);
        this.historyComponent = history.getComponent(BlackJackHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(history);
    }

    hideAllButtons() {
        this.splitButton?.getComponent(FadeEffectButton).setActive(false);
        this.doubleButton?.getComponent(FadeEffectButton).setActive(false);
        this.standButton?.getComponent(FadeEffectButton).setActive(false);
        this.hitButton?.getComponent(FadeEffectButton).setActive(false);
        this.newBetButton?.getComponent(FadeEffectButton).setActive(false);
        this.rebetAndDealButton?.getComponent(FadeEffectButton).setActive(false);
        this.clearButton?.getComponent(FadeEffectButton).setActive(false);
        this.dealButton?.getComponent(FadeEffectButton).setActive(false);
    }

    newGame() {
        this.hideAllButtons();
        this.totalBetLabel.string = "0";
        this.handPlaces.forEach((place) => {
            place.onClearBetClick(false);
            place.enablePlaceChip(true);
        });
        this.handPlaces[1].highlightPlace(true);
        this.dealerHand.resetView();
        this.roundFinished = false;
        this.finishHandler.clearCache();
        this.activeHand = null;

        this.clearWinningBet();
        this.clearWinningEffect();
    }

    updateAvailableActions() {
        if (!this.activeHand) {
            return;
        }

        this.hitButton?.getComponent(FadeEffectButton).setDisabled(this.activeHand.isStand);
        this.standButton?.getComponent(FadeEffectButton).setDisabled(this.activeHand.isStand);
        this.doubleButton
            ?.getComponent(FadeEffectButton)
            .setDisabled((!this.activeHand.canDouble && !this.activeHand.isStand) || this.activeHand.isStand);
        this.splitButton
            ?.getComponent(FadeEffectButton)
            .setDisabled((!this.activeHand.isStand && !this.activeHand.canSplit) || this.activeHand.isStand);
    }

    showActionsWithBehavior(behavior: number) {
        switch (behavior) {
            case BlackJackActionType.START_ROUND:
                this.setGameRoundStatus(BlackJackActionType.START_ROUND);
                this.startRoundActionVisibility(true);
                this.inRoundActionVisibility(false);
                this.finishActionVisibility(false);
                break;
            case BlackJackActionType.IN_ROUND:
                this.setGameRoundStatus(BlackJackActionType.IN_ROUND);
                this.inRoundActionVisibility(true);
                this.startRoundActionVisibility(false);
                this.finishActionVisibility(false);
                break;
            case BlackJackActionType.END_ROUND:
                this.setGameRoundStatus(BlackJackActionType.END_ROUND);
                this.finishActionVisibility(true);
                this.inRoundActionVisibility(false);
                this.startRoundActionVisibility(false);
                break;
            case BlackJackActionType.ERROR:
                this.setGameRoundStatus(BlackJackActionType.ERROR);
                this.startRoundActionVisibility(false);
                this.finishActionVisibility(false);
                break;
        }
    }

    startRoundActionVisibility(status: boolean) {
        this.dealButton?.getComponent(FadeEffectButton).setActive(status);
        this.clearButton?.getComponent(FadeEffectButton).setActive(status);
    }

    inRoundActionVisibility(status: boolean) {
        this.hitButton?.getComponent(FadeEffectButton).setActive(status);
        this.standButton?.getComponent(FadeEffectButton).setActive(status);
        this.doubleButton?.getComponent(FadeEffectButton).setActive(status);
        this.splitButton?.getComponent(FadeEffectButton).setActive(status);
    }

    disabledInRoundAction(status: boolean) {
        this.hitButton?.getComponent(FadeEffectButton).setDisabled(status);
        this.standButton?.getComponent(FadeEffectButton).setDisabled(status);
        this.doubleButton?.getComponent(FadeEffectButton).setDisabled(status);
        this.splitButton?.getComponent(FadeEffectButton).setDisabled(status);
    }

    finishActionVisibility(status: boolean) {
        this.rebetAndDealButton?.getComponent(FadeEffectButton).setActive(status);
        this.newBetButton?.getComponent(FadeEffectButton).setActive(status);
    }

    updateDisplayForRemoteConfig() {
        super.updateDisplayForRemoteConfig();
        this.updateDisplayMinMaxBet();
        this.updateOdds();
    }

    updateOdds() {
        const odds = `${GameUtils.roundFixed(+this.gameConfigs.odds.blackjack - 1, 2)}`;
        this.blackjackOddLabel.string = i18n.t("ui.blackjack_pay", { odds });
    }

    updateDisplayMinMaxBet() {
        this.minBetLabel.string = numberWithCommas(this.getMinBet());
        this.maxBetLabel.string = numberWithCommas(this.getMaxBet());
    }

    updateUserStakeLevel(data): boolean {
        const updated = super.updateUserStakeLevel(data);
        this.updateDisplayMinMaxBet();
        return updated;
    }

    playAudioNotification() {
        AudioManager.getInstance().playSFX(this.gameNotificationsAudio.clip);
    }

    setIntervalReminder() {
        this.stopIntervalReminder();
        this.audioNotificationInterval = setInterval(() => {
            if (!this.isAlive()) {
                return;
            }
            this.playAudioNotification();
        }, 300000);
    }

    stopIntervalReminder() {
        this.audioNotificationInterval && clearInterval(this.audioNotificationInterval);
    }

    playSingleChipsSound() {
        AudioManager.getInstance().playSFX(this.singleChipAudio.clip);
    }

    slidingDownBetChip(isMoveBottom: boolean, isAnimated = true) {
        const movePosition = cc.v3(
            this.betChipsContainer.parent.position.x,
            this.bottomBetChipsPos.position.y,
            this.betChipsContainer.parent.position.z
        );

        if (isAnimated) {
            cc.tween(this.betChipsContainer.parent)
                .to(
                    0.3,
                    {
                        position: isMoveBottom ? movePosition : this.betChipsPostion
                    },
                    { easing: isMoveBottom ? "easeOutCirc" : "easeInCirc" }
                )
                .start();
        } else {
            this.betChipsContainer.parent.position = isMoveBottom ? movePosition : this.betChipsPostion;
        }
    }
}

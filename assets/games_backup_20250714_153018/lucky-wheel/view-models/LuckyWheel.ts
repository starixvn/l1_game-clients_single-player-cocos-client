import * as i18n from "i18n/runtime-scripts/LanguageData";
import * as _ from "lodash";

import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import AudioManager from "../../../common/audio/AudioManager";
import { getLanguage, getLocale } from "../../../common/auth/SessionManager";
import UserService from "../../../common/auth/UserService";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { userManager } from "../../../common/user/UserManager";
import NoticeUtil from "../../../common/utils/NoticeUtil";
import WebViewGuide from "../../../common/webview-guide/WebViewGuide";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import LuckyWheelHistory from "./LuckyWheelHistory";
import LuckyWheelWinning from "./LuckyWheelWinning";
const { ccclass, property } = cc._decorator;

export enum LuckyWheelColor {
    Yellow = "yellow",
    Green = "green",
    Red = "red",
    Purple = "purple",
    Orange = "orange",
    Blue = "blue",
    Pink = "Pink"
}

export const LuckyWheelId = -1;

@ccclass
export default class LuckyWheel extends SocketIOMiniGameBase {
    @property(cc.Node)
    wheel: cc.Node = null;

    @property(cc.Node)
    indicator: cc.Node = null;

    @property(cc.Button)
    button: cc.Button = null;

    @property(cc.Label)
    availSpinsLbl: cc.Label = null;

    @property(cc.Label)
    totalScoinLbl: cc.Label = null;

    @property(cc.Node)
    wheelPieces: cc.Node = null;

    @property(cc.Node)
    piece: cc.Node = null;

    @property(cc.SpriteFrame)
    pinkPiece: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    yellowPiece: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    orangePiece: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    greenPiece: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    redPiece: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    purplePiece: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    defaultPiece: cc.SpriteFrame = null;

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    gamGuidePrefab: cc.Prefab = null;

    @property(cc.Node)
    winningEffect: cc.Node = null;

    @property(cc.Prefab)
    winningPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    goodLuckPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    bannerPrefab: cc.Prefab = null;

    @property(cc.Node)
    notice: cc.Node = null;

    @property(cc.Prefab)
    noticePrefab: cc.Prefab = null;

    scoinPresents: number[] = [];
    defaultAngle = 12;
    gameTime = 6;
    currentRotation = 0;
    lastRotation = 0;
    progress = 0;
    ratioWheel = 0;
    resultAngle = 0;

    timeTween: cc.Tween;
    indicatorTween: cc.Tween;
    currentScoin = 0;
    wheelTween: cc.Tween;
    wheelInitialized = false;
    buttonTween: cc.Tween;

    private readonly defaultRoundNumber = 4;

    colorDictionary = {
        0: LuckyWheelColor.Purple,
        10: LuckyWheelColor.Yellow,
        20: LuckyWheelColor.Pink,
        30: LuckyWheelColor.Green,
        50: LuckyWheelColor.Orange,
        100: LuckyWheelColor.Red
    };

    onLoad() {
        super.onLoad();
        this.buttonTween = cc
            .tween(this.button.node)
            .repeatForever(cc.tween().to(0.5, { scale: 0.92 }, { easing: "sineOutIn" }).to(0.5, { scale: 1 }, { easing: "sineOutIn" }));
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = LuckyWheelId;
    }

    onEnable() {
        super.onEnable();
        this.requestUpdateUserCoin();
    }

    playSpin() {
        this.socket.emit("playSpin");
    }

    requestUpdateUserCoin() {
        UserService.getBalance();
    }

    onData(data: any) {
        if (data.choices) {
            this.initWheel(data.choices);
        }

        if (data.status) {
            this.spin(data.status);
        }

        if (data.notice) {
            const errorCode = data.notice.errorCode;
            const message = NoticeUtil.getLocalizedErrorMessage(errorCode, {});
            this.showNotice(message);
        }

        if (void 0 !== data.availSpins) {
            this.availSpinsLbl.string = data.availSpins.toString();
            this.button.interactable = data.availSpins ? true : false;
            data.availSpins ? this.buttonTween.start() : this.buttonTween.stop();
        }

        if (void 0 !== data.scoins) {
            this.totalScoinLbl.string = numberWithCommas(data.scoins);
        }

        if (data.history && this.historyComponent) {
            this.historyComponent.onData(data.history);
        }

        data.um && this.umNotice.show(data);
    }

    shakeIndicator() {
        this.progress = 0;

        if (this.timeTween) {
            this.timeTween.stop();
        }

        if (this.indicatorTween) {
            this.indicatorTween.stop();
        }

        this.timeTween = cc.tween(this).to(0.26, { progress: 0.26 }).start();
        this.indicatorTween = cc
            .tween(this.indicator)
            .to(
                0.13,
                { angle: -10 },
                {
                    easing: (t) => {
                        return this.customizeBezierAnimation(t);
                    }
                }
            )
            .to(
                0.13,
                { angle: 3 },
                {
                    easing: (t) => {
                        return this.customizeBezierAnimation(t);
                    }
                }
            )
            .start();
    }

    initWheel(choices) {
        if (this.wheelInitialized) {
            return;
        }

        this.wheelInitialized = true;

        choices.forEach((coin) => {
            this.scoinPresents.push(coin);
        });

        this.createWheel();
    }

    onPressedSpin() {
        this.button.interactable = false;
        this.buttonTween.stop();
        this.playSpin();
    }

    autoBalanceRotation(rotateResult: number) {
        const multiple = Math.abs(Math.floor(rotateResult / 360));
        rotateResult -= (this.defaultRoundNumber - multiple) * 360;

        return rotateResult;
    }

    spin(data) {
        this.winningEffect.active = false;
        this.availSpinsLbl.string = data.availSpins.toString();

        const indexList = [];
        this.scoinPresents.forEach((value, index) => value === data.coins && indexList.push(index));
        const resultIndex = indexList[_.random(indexList.length - 1, 0)];

        const randomPosition = _.random(-3, 3);
        const offsetAngleResult = 360 - (this.wheel.angle % 360);
        let rotateResult = resultIndex * this.defaultAngle + this.defaultRoundNumber * -360 + offsetAngleResult - randomPosition;
        rotateResult = this.autoBalanceRotation(rotateResult);

        this.resultAngle = this.wheel.angle + rotateResult;
        this.shakeIndicator();
        this.wheelTween = cc
            .tween(this.wheel)
            .by(
                this.gameTime,
                { angle: rotateResult },
                {
                    progress: (start, end, current, ratio) => {
                        this.button.interactable = false;
                        this.ratioWheel = ratio;
                        this.currentRotation = this.wheel.angle;
                        const tolerance = this.currentRotation - this.lastRotation;
                        const temp = Math.round(this.currentRotation) % (360 / this.scoinPresents.length);
                        if (temp <= tolerance) {
                            if (this.progress > 0.2) {
                                this.shakeIndicator();
                            }
                        }
                        this.lastRotation = this.currentRotation;
                        return start + (end - start) * ratio;
                    },
                    easing: (t) => {
                        return this.customizeBezierAnimation(t);
                    }
                }
            )
            .call(() => {
                this.button.interactable = data.availSpins ? true : false;
                data.availSpins ? this.buttonTween.start() : this.buttonTween.stop();

                this.totalScoinLbl.string = numberWithCommas(data.totalCoins);
                if (data.coins === 0) {
                    this.handleGoodLuckEffect();
                } else {
                    this.handleWinningEffect(data.coins);
                    this.requestUpdateUserCoin();
                }
            })
            .start();
    }

    customizeBezierAnimation(time) {
        const point1 = 0,
            point2 = 0.69,
            point3 = 0.99999999,
            point4 = 1;
        return (
            Math.pow(1 - time, 3) * point1 +
            3 * time * Math.pow(1 - time, 2) * point2 +
            3 * Math.pow(time, 2) * (1 - time) * point3 +
            Math.pow(time, 3) * point4
        );
    }

    createWheel() {
        const goodLuckMessage = i18n.t("ui.goodluck_on_wheel").toUpperCase();

        this.scoinPresents.forEach((scoin, index) => {
            const pieceNode = cc.instantiate(this.piece);
            const spriteComponent = pieceNode.getComponent(cc.Sprite);
            const angle = index === 0 ? 0 : index * this.defaultAngle + 0.2;
            pieceNode.active = true;
            pieceNode.angle = -angle;

            const color = _.get(this.colorDictionary, scoin);
            let sprite: cc.SpriteFrame = null;

            switch (color) {
                case LuckyWheelColor.Purple:
                    sprite = this.purplePiece;
                    break;
                case LuckyWheelColor.Pink:
                    sprite = this.pinkPiece;
                    break;
                case LuckyWheelColor.Yellow:
                    sprite = this.yellowPiece;
                    break;
                case LuckyWheelColor.Orange:
                    sprite = this.orangePiece;
                    break;
                case LuckyWheelColor.Green:
                    sprite = this.greenPiece;
                    break;
                case LuckyWheelColor.Red:
                    sprite = this.redPiece;
                    break;
                default:
                    sprite = this.defaultPiece;
                    break;
            }
            spriteComponent.spriteFrame = sprite;
            pieceNode.getChildByName("scoin").getComponent(cc.Label).string = scoin === 0 ? goodLuckMessage : `${scoin} Scoin`;

            this.wheelPieces.addChild(pieceNode);
        });
    }

    showLuckyWheel() {
        AudioManager.getInstance().playClick();

        const dialog = this.node.getComponent(CommonDialog);
        dialog.showDialog();
    }

    onDisable() {
        super.onDisable();
        this.wheel.angle = this.resultAngle;
        if (this.wheelTween) {
            this.wheelTween.stop();
        }

        this.winningEffect.active = false;
        if (userManager.scoins) {
            const bannerNode = cc.instantiate(this.bannerPrefab);
            this.currentMiniPanel.addDialog(bannerNode);
        } else {
            uiManager.emitter.emit(InternalEvents.AFTER_LUCKY_WHEEL);
        }

        this.umNotice.hide();
        this.node.destroy();
    }

    onPressedHistory() {
        const node = cc.instantiate(this.historyPrefab);
        const history = node.getComponent(LuckyWheelHistory);
        history.init(this.socket);
        this.historyComponent = history;
        this.currentMiniPanel.addDialog(node);
    }

    onPressedGameGuide() {
        const dialog = cc.instantiate(this.gamGuidePrefab);
        const locale = getLocale();
        const language = getLanguage(locale);
        const guide = dialog.getComponent(WebViewGuide);
        guide.setURL(`/${language}/?name=luckyWheel&t=blue&c=0&f=sc&v=${Date.now()}`);
        this.currentMiniPanel.addDialog(dialog);
        guide.loadWebView();
    }

    handleWinningEffect(scoin: number) {
        this.winningEffect.active = true;
        this.winningEffect.destroyAllChildren();

        const winning = cc.instantiate(this.winningPrefab);
        const component = winning.getComponent(LuckyWheelWinning);
        component.updateScoin(scoin);
        this.winningEffect.addChild(winning);
    }

    handleGoodLuckEffect() {
        this.winningEffect.active = true;
        this.winningEffect.destroyAllChildren();
        const goodLuck = cc.instantiate(this.goodLuckPrefab);
        this.winningEffect.addChild(goodLuck);
    }

    showNotice(message: string) {
        const noticeNode = cc.instantiate(this.noticePrefab);
        const notice = noticeNode.getComponent("mini_warning");
        notice.text.string = message;
        this.notice.addChild(noticeNode);
    }
}

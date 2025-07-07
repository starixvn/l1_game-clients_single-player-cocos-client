import GameUtils from "../../common/GameUtils";
import { lobbyResourceManager } from "../../lobby/main/view-models/LobbyResourceManager";
import { themeResourceLoader } from "../../lobby/main/view-models/theme/ResourceLoader";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import RoundTime from "./RoundTime";
import { GameRoundTimerData, RoundTimerData } from "./RoundTimerData";
import { roundTimerManager } from "./RoundTimerManager";
import RoundTimerResult from "./RoundTimerResult";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniGameRoundTimer extends cc.Component {
    @property(cc.Node)
    result: cc.Node = null;

    @property(cc.Node)
    time: cc.Node = null;

    @property
    gameId = 0;

    @property
    resultDelayTime = 0;

    protected betOptions: string[] = [];
    protected gameConfig;
    private countDownTime: number;
    private roundResult: RoundTimerResult;
    private roundTime: RoundTime;
    private playTimeInterval: any;

    onLoad() {
        this.node.active = false;
        this.initRoundTime();
        this.initGameConfig();

        if (this.result) {
            this.roundResult = this.result.getComponent(RoundTimerResult);
            this.roundResult.betOptions = this.betOptions;
            this.roundResult.initCustomResult();
        }
    }

    async initRoundTime() {
        const prefab = await GameUtils.asyncExecute<cc.Prefab>(
            this.node,
            lobbyResourceManager?.hasCurrencyGroup()
                ? themeResourceLoader?.loadPrefab("mini-game/round-time")
                : GameUtils.loadResource(`minipanel/popup-mini-game/RoundTime`)
        );

        const node = GameUtils.createNodeFromPrefab(prefab);
        this.roundTime = node.getComponent(RoundTime);
        this.time?.addChild(node);
        this.hideRoundTimer();
        roundTimerManager.roundData && this.onReceivedData(roundTimerManager.roundData);
        this.registerEvents();
    }

    private registerEvents() {
        uiManager.emitterListener(InternalEvents.RECEIVED_ROUND_TIMER, (data) => this.onReceivedData(data), this);
        uiManager.emitterListener(InternalEvents.HIDE_POPUP_MINI_GAMES, () => this.hideRoundTimer(), this);
        uiManager.emitterListener(InternalEvents.GAME_IS_UM, (gameId) => this.handleDisabledGame(gameId), this);
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
        this.playTimeInterval && clearInterval(this.playTimeInterval);
    }

    private isInRound() {
        return this.countDownTime <= this.gameConfig.betTime && this.countDownTime >= this.gameConfig.minBetTime;
    }

    private isShowResult() {
        return this.countDownTime <= this.gameConfig.fullTime && this.countDownTime > this.gameConfig.betTime;
    }

    private hideRoundTimer() {
        this.result.active = false;
        this.time.active = false;
    }

    private showCountDownTime() {
        this.time.active = true;
        this.result.active = false;
    }

    private onReceivedData(data: RoundTimerData) {
        if (!data[this.gameId]) {
            return;
        }

        const { timeFromStart } = data[this.gameId];

        if (!timeFromStart && roundTimerManager.isDisabledGame(this.gameId)) {
            roundTimerManager.removeDisabledGames(this.gameId);
        }

        if (timeFromStart && roundTimerManager.isDisabledGame(this.gameId)) {
            return;
        }

        this.node.active = true;
        this.hideRoundTimer();

        this.countDownTime = timeFromStart ? this.resumeRoundTimer(timeFromStart) : this.gameConfig.fullTime;

        this.playTimeInterval && clearInterval(this.playTimeInterval);
        this.playTimeInterval = setInterval(() => {
            this.countDown();
        }, 1000);

        this.showResult(timeFromStart, data[this.gameId]);
    }

    private async showResult(timeFromStart: number, data: GameRoundTimerData) {
        try {
            if (!timeFromStart) {
                await GameUtils.delayTime(this.resultDelayTime);
            }

            if (this.isShowResult()) {
                this.result.active = true;
                this.roundResult.setResult(data);
            }
        } catch (e) {
            cc.log(e);
        }
    }

    private resumeRoundTimer(timeFromStart: number): number {
        return Math.round(this.gameConfig.fullTime - timeFromStart);
    }

    private countDown() {
        if (this.countDownTime < this.gameConfig.minBetTime) {
            this.hideRoundTimer();
            this.playTimeInterval && clearInterval(this.playTimeInterval);
            return;
        }

        if (this.isInRound()) {
            this.showCountDownTime();
            this.roundTime.setTime(this.countDownTime);
        }

        this.countDownTime--;
    }

    private handleDisabledGame(gameId: number) {
        if (this.gameId !== gameId) {
            return;
        }
        this.node.active = false;
    }

    protected initGameConfig() {
        // override
    }
}

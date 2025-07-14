import { BundleManager } from "bundle-management";

import CallbackAnimation from "../../../common/CallbackAnimation";
import CallbackLoopAnimation from "../../../common/CallbackLoopAnimation";
import AudioManager from "../../../common/audio/AudioManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import { SlotNotification } from "../../_slotgame_base/SlotGameBottomMessage";
import StandardSlotGameTopMessage from "../../_slotgame_base/StandardSlotGameTopMessage";
import CascadingUIModel from "../models/CascadingUIModel";
import CascadingBigWinAnimation from "./CascadingBigWinAnimation";
import CascadingSlotBase from "./CascadingSlotBase";
import { CascadingSlotConfig } from "./CascadingSlotBaseConfig";
import { CascadingSlotGameSound } from "./CascadingSlotGameSound";
import CascadingSymbolPreview from "./CascadingSymbolPreview";
import StandardCascadingBottomArea from "./StandardCascadingBottomArea";
import StandardCascadingSlotBoard from "./StandardCascadingSlotBoard";
import StandardCascadingSlotReelItem from "./StandardCascadingSlotReelItem";
import StandardCascadingSlotTumbleList from "./StandardCascadingSlotTumbleList";
import TotalMultiplierView from "./TotalMultiplierView";
import TumbleWinView from "./TumbleWinView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingSlotGame extends CascadingSlotBase {
    @property({ type: cc.Prefab, visible: false, override: true })
    effectBigWin: cc.Prefab = null;

    @property({ type: cc.Prefab, visible: false, override: true })
    effectFreeSpin: cc.Prefab = null;

    @property({ type: cc.Toggle, visible: false, override: true })
    autoSpinToggle: cc.Toggle = null;

    @property({ type: cc.Toggle, visible: false, override: true })
    turboToggle: cc.Toggle = null;

    @property({ type: cc.Label, visible: false, override: true })
    totalWinLabel: cc.Label = null;

    @property({ type: cc.Prefab, visible: false, override: true })
    flyWinLabelPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    topMessagePrefab: cc.Prefab = null;

    @property(cc.Node)
    topMsgNode: cc.Node = null;

    @property(cc.Node)
    bottomMessageArea: cc.Node = null;

    @property(cc.Node)
    bottomArea: cc.Node = null;

    @property(cc.Node)
    tumbleWinFrameNode: cc.Node = null;

    @property(cc.Node)
    totalMultiplierViewNode: cc.Node = null;

    @property(cc.Node)
    tumbleListNode: cc.Node = null;

    @property(cc.JsonAsset)
    musicInfo: cc.JsonAsset = null;

    @property(cc.JsonAsset)
    colorInfo: cc.JsonAsset = null;

    @property
    protected _gameId = 0;
    @property
    public get gameId(): number {
        return this._gameId;
    }
    public set gameId(value) {
        this._gameId = value;
    }

    bottomMessagePrefab: cc.Prefab;
    freespinViewPrefab: cc.Prefab;
    tumbleListPrefab: cc.Prefab;
    totalMultiplierPrefab: cc.Prefab;
    tumbleWinFramePrefab: cc.Prefab;
    tumbleItemPrefab: cc.Prefab;
    board: StandardCascadingSlotBoard;
    tumbleList: StandardCascadingSlotTumbleList;
    topMessage: StandardSlotGameTopMessage = null;
    private readonly previewSymbolLeft: cc.Prefab;
    private readonly previewSymbolRight: cc.Prefab;
    private readonly effectTransitionPrefab: cc.Prefab;
    private colorConfig: any;
    private bigWinAudioId: any;
    private incrementAudioId: any;

    audioClips = {};

    onLoad() {
        this.initColorConfig();
        super.onLoad();
        this.loadAudios();
        this.updateBalanceColor();
        uiManager.emitterListener(InternalEvents.CASCADING_SLOT_PLAY_SOUND, (type: CascadingSlotGameSound) => this.playSound(type), this);
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
        super.onDestroy();
    }

    protected initColorConfig() {
        this.colorConfig = this.colorInfo.json;
    }

    async onLoadedPrefabs() {
        await this.loadGameAtlas();
        this.initTumbleWinFrame();
        this.initTumbleWinList();
        this.initTotalMultiplierFrame();
        this.initTopMessage();
        this.loadSlotSymbols().then(async () => {
            await this.loadMultiplierPrefab();
            super.onLoadedPrefabs();
            this.board.previewPopup.onSymbolPreview = this.onSymbolPreview.bind(this);
        });

        this.callRegisterGame();
    }

    onEnable(): void {
        //overide empty
    }

    async loadPrefabsByCode() {
        const dict = {
            // prefab name : prefab property
            "effect-big-win": "effectBigWin",
            "effect-freespin": "effectFreeSpin",
            "total-multiplier-frame": "totalMultiplierPrefab",

            "tumble-win-frame": "tumbleWinFramePrefab",
            "tumble-list": "tumbleListPrefab",
            "tumble-item": "tumbleItemPrefab",

            "preview-symbol-left": "previewSymbolLeft",
            "preview-symbol-right": "previewSymbolRight",
            "effect-transition": "effectTransitionPrefab",
            "fly-win-label": "flyWinLabelPrefab"
        };

        for (const key of Object.keys(dict)) {
            const path = `preload/prefabs/${key}`;
            const devPath = `../games/*/${path}`;
            try {
                const prefab = await BundleManager.getInstance().loadAsset<cc.Prefab>({
                    bundleId: this.gameId.toString(),
                    path: path,
                    pathForDevMode: devPath,
                    type: cc.Prefab
                });

                this[dict[key]] = prefab;
            } catch (e) {
                console.warn(`Missing prefab for ${path} `, e);
            }
        }
    }

    async loadMultiplierPrefab() {
        const prefabCache = uiManager.prefabCache.multiplierPrefab[this.gameId] || {};
        if (prefabCache !== null) {
            const path = `preload/prefabs/multiplier`;
            const devPath = `../games/*/${path}`;
            try {
                const prefab = await BundleManager.getInstance().loadAsset<cc.Prefab>({
                    bundleId: this.gameId.toString(),
                    path: path,
                    pathForDevMode: devPath,
                    type: cc.Prefab
                });

                uiManager.prefabCache.multiplierPrefab[this.gameId] = prefab;
            } catch (e) {
                console.warn(`Missing prefab for ${path} `, e);
            }
        }
    }

    async loadGameAtlas() {
        let spriteAtlas = uiManager.prefabCache.gameAtlas[this.gameId];

        if (spriteAtlas) {
            return;
        }

        const path = `resources/textures/standard-cascading-slot`;
        const devPath = `../games/*/${path}`;
        try {
            spriteAtlas = await BundleManager.getInstance().loadAsset<cc.SpriteAtlas>({
                bundleId: this.gameId.toString(),
                path: path,
                pathForDevMode: devPath,
                type: cc.SpriteAtlas
            });
        } catch (e) {
            cc.warn(`Missing Symbols spriteAtlas for ${path} `, e);
        }
        uiManager.prefabCache.gameAtlas[this.gameId] = spriteAtlas;
    }

    async loadSlotSymbols() {
        const prefabCache = uiManager.prefabCache.slotSymbols[this.gameId] || {};
        for (let index = 0; index < CascadingSlotConfig?.symbolCount; index++) {
            if (prefabCache[index]) {
                continue;
            }
            const path = `preload/symbol-spines/symbol-${index}`;
            const devPath = `../games/*/${path}`;
            try {
                const data = await BundleManager.getInstance().loadAsset<sp.SkeletonData>({
                    bundleId: this.gameId.toString(),
                    path: path,
                    pathForDevMode: devPath,
                    type: sp.SkeletonData
                });

                prefabCache[index] = data;
            } catch (error) {
                console.warn(`Missing SkeletonData for ${path} `, error);
            }
        }

        uiManager.prefabCache.slotSymbols[this.gameId] = prefabCache;
    }

    loadAudios() {
        const dict = {
            [CascadingSlotGameSound.SPIN_BUTTON]: "spin-button",
            [CascadingSlotGameSound.DROP_IN]: "spinning-normal",
            [CascadingSlotGameSound.MULTIPLIER_APPEAR]: "multiplier-appear",
            [CascadingSlotGameSound.BIG_WIN]: "big-win",
            [CascadingSlotGameSound.BIG_WIN_STOP]: "big-win-increment-ended",
            [CascadingSlotGameSound.FREE_SPIN]: "freespin",

            [CascadingSlotGameSound.TURBO_DROP_IN]: "spinning-turbo",
            [CascadingSlotGameSound.REEL_STOP]: "reelstop1",
            [CascadingSlotGameSound.REEL_STOP_1]: "reelstop2",
            [CascadingSlotGameSound.REEL_STOP_2]: "reelstop3",

            [CascadingSlotGameSound.REEL_STOP_3]: "reelstop4",
            [CascadingSlotGameSound.REEL_STOP_4]: "reelstop5",
            [CascadingSlotGameSound.REEL_STOP_5]: "reelstop5",
            [CascadingSlotGameSound.SYMBOL_EXPLODE]: "symbol-match",
            [CascadingSlotGameSound.INCREMENT]: "increment",
            [CascadingSlotGameSound.INCREMENT_STOP]: "increment-stop",
            [CascadingSlotGameSound.TRANSITION]: "transition",
            [CascadingSlotGameSound.COIN]: "coin",
            [CascadingSlotGameSound.CLICK]: "click"
        };

        for (const key of Object.keys(dict)) {
            const path = `preload/audios/${dict[key]}`;
            const devPath = `../games/*/${path}`;
            BundleManager.getInstance()
                .loadAsset<cc.AudioClip>({
                    bundleId: this.gameId.toString(),
                    path: path,
                    pathForDevMode: devPath,
                    type: cc.AudioClip
                })
                .then((clip) => {
                    if (clip) {
                        this.audioClips[key] = clip;
                    }
                })
                .catch(() => {
                    console.warn("missing audio for", path);
                });
        }
    }

    updateBalanceColor() {
        this.userProfile.updateColor(this.colorConfig.bottomAreaWinAmountColor);
    }

    onSymbolPreview(symbol: StandardCascadingSlotReelItem, worldPosition: cc.Vec3, isInfoOnLeft: boolean) {
        if (!this.gameConfigs?.odds || !this.isFinishedRound) {
            return;
        }
        this.playSound(CascadingSlotGameSound.CLICK);

        const previewPrefab = isInfoOnLeft ? this.previewSymbolLeft : this.previewSymbolRight;
        const previewNode = cc.instantiate(previewPrefab);

        const symbolPreview = previewNode.getComponent(CascadingSymbolPreview);
        this.board.showPreview(previewNode, worldPosition);
        symbolPreview.setInfo({
            spine: null,
            odds: this.gameConfigs.odds.symbols[symbol.index],
            colorList: [this.colorConfig.previewOddsSymbolNumberColor, this.colorConfig.previewOddsWinValueColor],
            borderColor: this.colorConfig.previewOddsBorderColor,
            coinValue: this.currCoinValue,
            betLevel: this.currBetLevel,
            freespin: this.gameConfigs.odds.freeSpins.initialOdds,
            symbolItem: symbol,
            gameId: this.gameId
        });
    }

    playSound(type: CascadingSlotGameSound, loop = false): number {
        if (this.audioClips[type]) {
            return AudioManager.getInstance().playSFX(this.audioClips[type], loop);
        }
        return -1;
    }

    stopSoundSFX(audioId: number) {
        AudioManager.getInstance().stopSFX(audioId);
    }

    initPrefabGame(prefab: cc.Prefab, node: cc.Node) {
        const nodeTmp = cc.instantiate(prefab);
        node.addChild(nodeTmp);
    }

    initTumbleWinList() {
        const node = cc.instantiate(this.tumbleListPrefab);
        this.tumbleListNode.addChild(node);
        this.tumbleList = node.getComponent(StandardCascadingSlotTumbleList);
        this.tumbleList.mainAtlas = uiManager.prefabCache.gameAtlas[this.gameId];
        this.tumbleList.tumbleItem = this.tumbleItemPrefab;
    }

    initTumbleWinFrame() {
        const node = cc.instantiate(this.tumbleWinFramePrefab);
        this.tumbleWinFrameNode.addChild(node);
        this.tumbleWinView = node.getComponent(TumbleWinView);
        this.tumbleWinView.showViewQuickly(false);
    }

    initTotalMultiplierFrame() {
        const node = cc.instantiate(this.totalMultiplierPrefab);
        this.totalMultiplierViewNode.addChild(node);
        this.totalMultiplierView = node.getComponent(TotalMultiplierView);
        this.totalMultiplierView.showViewQuickly(false);
    }

    initBottomArea(node: cc.Node) {
        const bottomArea = node.getComponent(StandardCascadingBottomArea);

        bottomArea.updateColor({
            textColor: this.colorConfig.bottomAreaTextColor,
            numberColor: this.colorConfig.bottomAreaNumberColor,
            buttonBorderColor: this.colorConfig.bottomAreaButtonBorderColor,
            winAmountColor: this.colorConfig.bottomAreaWinAmountColor,
            bgFrameColor: this.colorConfig.bottomAreaButtonBackgroundColor
        });

        this.miniBetControl = bottomArea.miniBetControl;
        this.checkExistNodeBet();
        this.autoSpinToggle = bottomArea.autoSpinToggle;
        this.turboToggle = bottomArea.turboToggle;
        this.totalWinLabel = bottomArea.totalWinLabel;

        bottomArea.onClickListener = {
            onAutoSpinChanged: () => {
                uiManager.emitter.emit(InternalEvents.CASCADING_CLOSE_MENU);
                this.onAutoSpinChanged();
            },
            onTurboModeChanged: (toggle) => {
                this.onTurboModeChanged(toggle);
            }
        };
    }

    clickOutsideReelArea() {
        super.clickOutsideReelArea();
        uiManager.emitter.emit(InternalEvents.CASCADING_CLOSE_MENU);
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.gameData.uiModel.on(CascadingUIModel.Events.SET_FREESPINS, (value: number) => {
            this.bottomMessage.freeSpinCount = value;
            this.bottomMessage && this.bottomMessage.showMessages(SlotNotification.FREESPINS);
        });
        this.gameData.uiModel.on(CascadingUIModel.Events.INCREASE_FREESPINS, (value: number) => {
            this.bottomMessage.freeSpinCount = value;
        });
        this.gameData.uiModel.on(CascadingUIModel.Events.SHOW_FREESPINS, (show: boolean) => {
            this.bottomMessage && this.bottomMessage.showMessages(SlotNotification.FREESPINS);
        });
    }

    flyWinLabelAnimation(node: cc.Node) {
        node.scale = 0.9;
        node.opacity = 255;
        cc.tween(node)
            .parallel(cc.tween().to(0.1, { scale: 1.3 }), cc.tween().by(0.1, { y: 15 }, { easing: "sineOut" }))
            .parallel(
                cc.tween().to(0.5, { scale: 1 }, { easing: "sineOut" }).to(0.5, { opacity: 0, scale: 0.9 }, { easing: "sineOut" }),
                cc.tween().by(0.5, { y: 25 }, { easing: "sineOut" }).by(0.5, { y: 10 }, { easing: "sineOut" })
            )
            .call(() => {
                node.destroy();
            })
            .start();
    }

    protected soundEndForBigWinStandard(bigWinAudioId: number, incrementAudioId: number) {
        this.playSound(CascadingSlotGameSound.BIG_WIN_STOP);
        this.playSound(CascadingSlotGameSound.INCREMENT_STOP);
        this.stopSoundSFX(bigWinAudioId);
        this.stopSoundSFX(incrementAudioId);
    }

    override async showEffectBigWin(betWin: number) {
        const transtition = await this.playEffectTransition();
        await super.showEffectBigWin(betWin);
        transtition?.destroy();
    }

    bigWinForTurBoMode(betWin: number, bigWinAnimation: CascadingBigWinAnimation) {
        const totalBet = this.winAmountForNoAnim(betWin, bigWinAnimation);
        const ratio = betWin / totalBet;
        bigWinAnimation.showHideBigWinNode(ratio < 3);
    }

    bigWinForNormalMode(betWin: number, bigWinAnimation: CascadingBigWinAnimation, callbackAnim: CallbackLoopAnimation) {
        const totalBet = parseFloat(this.betControl.totalBet.string.replace(/,/g, ""));
        const coinValue = parseFloat(this.betControl.coinValue.string);
        bigWinAnimation
            .showWinAmountForBigWinAnim(betWin, totalBet, coinValue, () => {
                this.soundEndForBigWinStandard(this.bigWinAudioId, this.incrementAudioId);
                callbackAnim.closeLater();
            })
            .catch((reason) => console.log(reason));
    }

    protected skipCallbackBigWin(betWin: number, bigWinAnimation: CascadingBigWinAnimation) {
        this.winAmountForNoAnim(betWin, bigWinAnimation);
    }

    protected soundForBigWin() {
        this.bigWinAudioId = this.playSound(CascadingSlotGameSound.BIG_WIN, true);
        this.incrementAudioId = this.playSound(CascadingSlotGameSound.INCREMENT, true);
    }

    private winAmountForNoAnim(betWin: number, bigWinAnimation: CascadingBigWinAnimation) {
        const totalBet = parseFloat(this.betControl.totalBet.string.replace(/,/g, ""));
        this.soundEndForBigWinStandard(this.bigWinAudioId, this.incrementAudioId);
        bigWinAnimation.changeFrameForBigWinLevel(betWin, totalBet);
        bigWinAnimation.setAmount({ amount: betWin });
        return totalBet;
    }

    initBetControl(node: cc.Node) {
        super.initBetControl(node);
        this.betControl.updateColor({
            textColor: this.colorConfig.bottomAreaTextColor,
            numberColor: this.colorConfig.bottomAreaNumberColor,
            buttonBorderColor: this.colorConfig.bottomAreaButtonBorderColor
        });
    }

    protected async playEffectTransition() {
        if (!this.effectTransitionPrefab) {
            return null;
        }
        const effect = cc.instantiate(this.effectTransitionPrefab);
        const animation = effect.getComponent(CallbackAnimation);
        animation.autoDestroyNode = false;
        this.playSound(CascadingSlotGameSound.TRANSITION);
        await this.showEffect(effect);
        return effect;
    }

    async showEffectFreeSpins(count: number) {
        const transtition = await this.playEffectTransition();
        await super.showEffectFreeSpins(count);
        transtition?.destroy();
    }

    onTrialModeChanged(toggle: cc.Toggle) {
        super.onTrialModeChanged(toggle);
        uiManager.emitter.emit(InternalEvents.CASCADING_CLICK_CHANGE_MODE);
    }

    showBottomMessageOnGameState() {
        super.showBottomMessageOnGameState();
        this.updateBottomMessageStatus();
    }

    updateBottomMessageStatus() {
        super.updateBottomMessageStatus();
        this.bottomMessage && (this.bottomMessage.isFreeSpin = this.isFreeSpin());
    }

    initTopMessage() {
        if (!this.topMessagePrefab) {
            return;
        }
        const topMsg = cc.instantiate(this.topMessagePrefab);
        this.topMsgNode.addChild(topMsg);
        this.topMessage = topMsg.getComponent(StandardSlotGameTopMessage);
        this.topMessage.mainAtlas = uiManager.prefabCache.gameAtlas[this.gameId];
        this.topMessage.updateColor(this.colorConfig.topMessageTextColor);
    }

    protected initGameSongList() {
        this.songListConfig = this.musicInfo.json;
        super.initGameSongList();
    }

    updateMiniWarningContent(miniWarningComp, data: string) {
        data = data.toUpperCase();
        super.updateMiniWarningContent(miniWarningComp, data);
    }

    onAutoSpinChanged() {
        this.saveSettingKey("autoSpin", this.autoSpinToggle.isChecked);
        super.onAutoSpinChanged();
    }

    initShowBottomMessage(node: cc.Node) {
        super.initShowBottomMessage(node);
        this.bottomMessage?.updateColor(this.colorConfig.noticeTextColor, this.colorConfig.noticeHighlightTextColor);
    }
}

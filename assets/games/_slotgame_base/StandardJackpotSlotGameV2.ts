import GameUtils from "../../common/GameUtils";
import { ClassicSlotSound } from "./ClassicSlotSound";
import StandardJackpotSlotGame from "./StandardJackpotSlotGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardJackpotSlotGameV2 extends StandardJackpotSlotGame {
    @property
    hasJackpot = true;

    @property({
        type: cc.Node,
        visible: function (this: StandardJackpotSlotGameV2) {
            return this.hasJackpot;
        },
        override: true
    })
    jackpotPoolNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: function (this: StandardJackpotSlotGameV2) {
            return this.hasJackpot;
        },
        override: true
    })
    topWinnersButton: cc.Node = null;

    @property({ type: cc.Prefab, visible: false, override: true })
    jackpotGamePrefab: cc.Prefab = null;

    protected getPrefabsList(): Record<string, string> {
        return {
            "preview-symbol-left": "previewSymbolLeft",
            "preview-symbol-right": "previewSymbolRight"
        };
    }

    start() {
        this.loadLinePrefabs().then(() => {
            if (this.autoGenerateLines) {
                this.createAllLines();
            }
        });
    }

    protected override lazyLoadResources() {
        this.loadDelayedAudios();
        this.loadDelayedPrefabsByCode();
        if (this.jackpotEnabled) {
            this.loadJackpotGamePrefab();
        }
    }

    private async loadLinePrefabs() {
        const linePrefabs = {
            "line-normal": "linePrefab",
            "line-glow": "lightLinePrefab"
        };
        try {
            for (const key of Object.keys(linePrefabs)) {
                await GameUtils.asyncExecute(this?.node, this.loadPrefabWithBundle(key, linePrefabs[key], ""));
            }
        } catch (error) {
            cc.warn("Error occur when load line prefabs ", error);
        }
    }

    private async loadDelayedPrefabsByCode() {
        const dict = this.getDelayedPrefabsList();

        try {
            for (const key of Object.keys(dict)) {
                await GameUtils.asyncExecute(this?.node, this.loadPrefabWithBundle(key, dict[key], ""));
            }
        } catch (error) {
            cc.warn("Error occur when lazy load prefabs ", error);
        }
    }

    protected getDelayedPrefabsList(): Record<string, string> {
        const normalPrefabs = {
            // prefab name : prefab property
            "effect-transition": "effectTransitionPrefab",

            "effect-bonus": "effectBonus",
            "effect-big-win": "effectBigWin",
            "effect-freespin": "effectFreeSpin",

            "dialog-bonus": "bonusDialog",
            "bonus-item": "not_assign_property"
        };

        if (!this.jackpotEnabled) {
            return normalPrefabs;
        }
        const jackpotPrefab = {
            "effect-jackpot": "effectJackpot"
        };
        return { ...normalPrefabs, ...jackpotPrefab };
    }

    protected getAudioDictionary(): Record<string, string> {
        return {
            [ClassicSlotSound.SPIN]: "spin-button",
            [ClassicSlotSound.WIN]: "win",
            [ClassicSlotSound.SPINNING_NORMAL]: "spinning-normal",
            [ClassicSlotSound.SPINNING_TURBO]: "spinning-turbo",

            [ClassicSlotSound.REEL_STOP]: "reel-stop",
            [ClassicSlotSound.CLICK]: "click",

            [ClassicSlotSound.TRANSITION]: "transition",
            [ClassicSlotSound.SYMBOL_WIN]: "symbol-win"
        };
    }

    protected getDelayedAudiosDictionary(): Record<string, string> {
        const jackpotSound = {
            [ClassicSlotSound.JACKPOT]: "jackpot-hit",
            [ClassicSlotSound.JACKPOT_ITEM]: "jackpot-item",
            [ClassicSlotSound.JACKPOT_WIN]: "jackpot-win"
        };
        const normalSound = {
            [ClassicSlotSound.BIG_WIN]: "big-win",
            [ClassicSlotSound.FREESPIN]: "freespin",
            [ClassicSlotSound.BONUS]: "bonus",

            [ClassicSlotSound.BONUS_POPUP]: "bonus-popup",
            [ClassicSlotSound.BONUS_ITEM]: "bonus-item",
            [ClassicSlotSound.BONUS_TOTAL]: "bonus-total"
        };


        if (!this.jackpotEnabled) {
            return normalSound;
        }
        return { ...normalSound, ...jackpotSound };
    }

    private loadDelayedAudios() {
        const dict = this.getDelayedAudiosDictionary();

        this.loadAudioFromDictionary(dict, "");
    }

    onSymbolPreview(symbol: any, worldPosition: cc.Vec3, isInfoOnLeft: boolean): void {
        if (isInfoOnLeft) {
            if (!this.previewSymbolLeft) {
                cc.warn("waiting for load previewSymbolLeft");
                return;
            }
        } else if (!this.previewSymbolRight) {
            cc.warn("waiting for load previewSymbolRight");
            return;
        }
        super.onSymbolPreview(symbol, worldPosition, isInfoOnLeft);
    }

    async showEffectFreeSpin() {
        try {
            if (!this.effectFreeSpin) {
                await this.loadPrefabWithBundle("effect-freespin", "effectFreeSpin", "");
            }
            await super.showEffectFreeSpin();
        } catch (error) {
            cc.warn("Error when show effect free spin", error);
        }
    }

    async showEffectBigWin(betWin: number) {
        try {
            if (!this.effectBigWin) {
                await this.loadPrefabWithBundle("effect-big-win", "effectBigWin", "");
            }
            await super.showEffectBigWin(betWin);
        } catch (error) {
            cc.warn("Error when show effect big win", error);
        }
    }

    async showEffectBonus(bonus: number): Promise<void> {
        try {
            if (!this.effectBonus) {
                await this.loadPrefabWithBundle("effect-bonus", "effectBonus", "");
            }
            await super.showEffectBonus(bonus);
        } catch (error) {
            cc.warn("Error when show effect bonus", error);
        }
    }

    async showEffectJackpot(amount: number) {
        try {
            if (!this.effectJackpot) {
                await this.loadPrefabWithBundle("effect-jackpot", "effectJackpot", "");
            }
            await super.showEffectJackpot(amount);
        } catch (error) {
            cc.warn("Error when show effect jackpot", error);
        }
    }

    protected async showBonusDialog(bonus: number, onBonusFinished) {
        try {
            if (!this.bonusDialog) {
                await this.loadPrefabWithBundle("dialog-bonus", "bonusDialog", "");
            }
            super.showBonusDialog(bonus, onBonusFinished);
        } catch (error) {
            cc.warn("Error when show bonus dialog", error);
        }
    }

    async handleNewJackpot(jackpot: any) {
        try {
            if (!this.effectJackpot) {
                await this.loadPrefabWithBundle("effect-jackpot", "effectJackpot", "");
            }
            await super.handleNewJackpot(jackpot);
        } catch (error) {
            cc.warn("Error when show effect jackpot", error);
        }
    }
}

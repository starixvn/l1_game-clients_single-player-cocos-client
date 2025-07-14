import * as i18n from "i18n/runtime-scripts/LanguageData";

import GameUtils from "../../../common/GameUtils";
import { CascadingSlotFinishData, Tumble, WinIconDetail } from "../models/CascadingSlotFinishModel";
import { CascadingSlotState } from "../models/CascadingSlotStateModel";
import { SpinButtonState } from "../models/SpinButtonStateModel";
import CascadingSlotBase from "../view-models/CascadingSlotBase";
import { CascadingSlotGameSound } from "../view-models/CascadingSlotGameSound";
import { convertBoardValue, convertData } from "../view-models/CascadingSlotUtils";

export const handleSettle = (mainGame: CascadingSlotBase) => async (data: CascadingSlotFinishData) => {
    const { win, roundId, totalFreeSpins, isFreeSpin, multiplier, totalMultiplier, reachMaxWin, tumbles } = data;
    mainGame.gameData.stateModel.change(CascadingSlotState.Spinning);
    mainGame.showProcessingWarning(false);
    mainGame.setGameRound(roundId);

    const isTurbo = mainGame.isTurboMode();
    const result = convertData(data.result);
    const multipliers = [...tumbles[0].multipliers];
    const getMultiplier = multipliers.length > 0;
    !mainGame.board.boardSound && (mainGame.board.boardSound = mainGame.gameSound);
    await mainGame.board.spinResult(result, multipliers, isTurbo);

    if (getMultiplier) {
        mainGame.gameData.uiModel.getMultiplier();
    }

    await handleTumbles(mainGame, tumbles, isTurbo);
    const winMultiplier = multiplier > 0 && win > 0;
    await handleMultiplier(mainGame, isFreeSpin, winMultiplier);
    await updateTotalWin(mainGame, data);
    updateUserBalance(mainGame);

    const needShowTotalMultiplier = totalMultiplier > 0;
    if (winMultiplier && isFreeSpin && needShowTotalMultiplier) {
        await mainGame.totalMultiplierView.showView(true);
        await movingMultiplier(mainGame.tumbleWinView.multiplier.node, mainGame.effectContainer, mainGame.totalMultiplierView.total.node);
    }
    mainGame.gameData.uiModel.changeTotalMultiplier({
        value: totalMultiplier,
        show: needShowTotalMultiplier
    });

    if (reachMaxWin) {
        mainGame.showMiniWarning(i18n.t("cascadingSlot.reachMaxWin"));
        await GameUtils.delayTime(3);
    }

    await showEffectSpecialCase(mainGame, data);
    mainGame.gameData.uiModel.setFreeSpins(totalFreeSpins);
    mainGame.gameData.uiModel.showFreeSpins(totalFreeSpins > 0);

    const delayForNextSpin = mainGame.getCustomDuration("delayForNextSpin");
    await GameUtils.delayTime(delayForNextSpin);
    mainGame.gameData.stateModel.change(CascadingSlotState.Settled);
    handleAutoSpin(mainGame);
};

const updateTotalWin = async (mainGame: CascadingSlotBase, data: CascadingSlotFinishData) => {
    const { win, actualBetwin } = data;
    if (win > 0) {
        await mainGame.tumbleWinView.setTotalWinValue(actualBetwin);
        mainGame.gameData.uiModel.setTotalWin(win);
    }
};

const updateUserBalance = (mainGame: CascadingSlotBase) => {
    if (mainGame.isTrialMode) {
        mainGame.gameData.trialModel.updateSettledBalance();
    } else {
        mainGame.updateUserBalance();
    }
};

const showEffectSpecialCase = async (mainGame: CascadingSlotBase, data: CascadingSlotFinishData) => {
    const { bigWin, freeSpins } = data;
    if (bigWin) {
        await mainGame.showEffectBigWin(data.win);
    }

    if (freeSpins > 0) {
        await mainGame.board.highlightScatterItems();
        await mainGame.showEffectFreeSpins(freeSpins);
    }
};

const handleTumbles = async (mainGame: CascadingSlotBase, tumbles: Tumble[], isTurbo: boolean) => {
    let multiplierCount = tumbles[0].multipliers.length;

    for (let i = 0; i < tumbles.length - 1; i++) {
        const tumble = tumbles[i];
        const { icons, win: tumbleWin, settlement } = tumble;

        const newTumbleMultipliers = [...tumbles[i + 1].multipliers];
        const getMoreMultiplier = newTumbleMultipliers.length > multiplierCount;
        if (getMoreMultiplier) {
            multiplierCount = newTumbleMultipliers.length;
        }
        const tumbleMultipliers = newTumbleMultipliers;
        const explode = convertBoardValue(settlement.explode);
        const newItems = convertBoardValue(settlement.new);

        if (tumbleWin > 0) {
            Object.keys(icons).forEach((iconKey) => {
                const winIconDetail: WinIconDetail = icons[iconKey];
                const node = mainGame.board.getRandomWinItem(explode, +iconKey);
                const position = mainGame.effectContainer.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v3(0, 0)));
                mainGame.createFlyWinLabel(mainGame.effectContainer, position, winIconDetail.win);
            });
            mainGame.gameData.uiModel.increaseTumbleWin(tumbleWin);
        }

        mainGame.gameData.uiModel.getTumble();
        mainGame.tumbleList.addIcons(icons);

        await mainGame.board.removeItems(explode, i);
        mainGame.board.addItems(newItems);
        mainGame.board.updateMultiplierItems(tumbleMultipliers);
        await mainGame.board.fallIn(isTurbo);
        if (getMoreMultiplier) {
            mainGame.gameData.uiModel.getMultiplier();
        }
    }
};

const handleAutoSpin = (mainGame: CascadingSlotBase) => {
    mainGame.updateBottomMessageStatus();
    if (!mainGame.showNoticeForCacheApiError()) {
        const isAutoSpinMode = mainGame.isAutoSpinMode();
        const stillAutoSpin = mainGame.stillAutoSpin();
        const autoSpin = isAutoSpinMode && stillAutoSpin;
        if (autoSpin) {
            mainGame.gameData.spinButtonStateModel.change(SpinButtonState.AutoSpin);
            mainGame.spin();
        } else if (mainGame.isFreeSpin()) {
            mainGame.spin();
        } else if (isAutoSpinMode && !stillAutoSpin) {
            mainGame.createAutoSpinDialog();
        } else {
            mainGame.onAutoSpinOff();
        }
    } else {
        mainGame.onAutoSpinOff();
    }
};

const handleMultiplier = async (mainGame: CascadingSlotBase, isFreeSpin: boolean, winMultiplier: boolean) => {
    const currentTotalMultiplier = mainGame.gameData.uiModel.totalMultiplier;
    const needMoveTotalMultiplier = isFreeSpin && winMultiplier && currentTotalMultiplier > 0;

    if (needMoveTotalMultiplier) {
        await mainGame.tumbleWinView.shiftRightTumbleWin(currentTotalMultiplier);
        await movingMultiplier(mainGame.totalMultiplierView.total.node, mainGame.effectContainer, mainGame.tumbleWinView.multiplier.node);
        mainGame.gameData.uiModel.increaseMultiplier(currentTotalMultiplier);
    }

    if (winMultiplier) {
        const multiplierItems = mainGame.board.getMultiplierItems();
        for (const mItem of multiplierItems) {
            mainGame.playSound(CascadingSlotGameSound.MULTIPLIER_APPEAR);
            await mItem.playAnimationGlow();
            await mainGame.tumbleWinView.shiftRightTumbleWin(mItem.multiplier);
            await movingMultiplier(mItem.value.node, mainGame.effectContainer, mainGame.tumbleWinView.multiplier.node);
            mainGame.playSound(CascadingSlotGameSound.COIN);
            mainGame.gameData.uiModel.increaseMultiplier(mItem.multiplier);
        }

        await GameUtils.delayTime(mainGame.tumbleWinView.mulitiplierEffectDuration);
    }
};

const movingMultiplier = (multiplierNode: cc.Node, container: cc.Node, destNode: cc.Node) => {
    return new Promise<void>((resolve) => {
        const node = cc.instantiate(multiplierNode);
        node.active = true;
        const startPos = container.convertToNodeSpaceAR(multiplierNode.convertToWorldSpaceAR(cc.v3(0)));
        const destPos = container.convertToNodeSpaceAR(destNode.convertToWorldSpaceAR(cc.v3(0)));
        container.addChild(node);
        node.position = startPos;

        const distance = startPos.sub(destPos).mag();
        const pixelPerSecond = 750;
        const duration = distance / pixelPerSecond;
        cc.tween(node)
            .to(duration * 0.3, { scale: 1.5 }, { easing: "sineOut" })
            .to(duration * 0.69, { scale: 1 }, { easing: "sineIn" })
            .start();
        cc.tween(node)
            .to(duration, { position: destPos }, { easing: "sineOut" })
            .call(() => {
                resolve();
                node.destroy();
            })
            .start();
    });
};

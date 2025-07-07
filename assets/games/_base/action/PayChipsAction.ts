import * as _ from "lodash";

import GameUtils from "../../../common/GameUtils";
import { getLowercaseObjectKeys } from "../../../common/helpers/ObjectHelper";
import { appManager } from "../../../managers/AppManager";
import TableGameBaseInterface from "../../_base_new/view-models/TableGameBaseInterface";
import BetItem from "../view-models/BetItem";

export interface PayChipInfo {
    mainRoomGame: TableGameBaseInterface;
    winBetItems: BetItem[];
    winningPlayers: any;
    winningDuration: number;
    payChipsDuration: number;
    isChipStack: boolean;
}

export const payChips = (
    main: TableGameBaseInterface,
    settlementResult: any,
    winningPlayers: any,
    payChipFlyTime: number,
    winningAnimationDuration: number,
    isChipStack = false
) => {
    const mainRoomGame = main;
    const payChipsDuration = payChipFlyTime;
    const winningDuration = winningAnimationDuration;
    if (!mainRoomGame || !settlementResult || !mainRoomGame.enablePlaceChips || !main.node) {
        return;
    }
    const settlementResultKeys = getLowercaseObjectKeys(settlementResult);
    const lostBetItems = _.filter(main.betItems, (item) => !settlementResult[settlementResultKeys[item.node.name.toLowerCase()]]);
    const winBetItems = _.filter(main.betItems, (item) => !!settlementResult[settlementResultKeys[item.node.name.toLowerCase()]]);

    const payChipInfo: PayChipInfo = {
        mainRoomGame,
        winBetItems,
        winningPlayers,
        payChipsDuration,
        winningDuration,
        isChipStack
    };
    if (!main.node.activeInHierarchy) {
        dealerGetChips(mainRoomGame, lostBetItems);
        dealerPayChips(mainRoomGame, winBetItems);
        isChipStack && removeChipStack(winBetItems);
        mainRoomGame.payChipToAllPlayers(payChipInfo);
    } else {
        main.node.runAction(
            cc.sequence(
                cc.delayTime(main.betChips.chipDelayFlyingTime),
                cc.callFunc(() => dealerGetChips(mainRoomGame, lostBetItems)),
                cc.delayTime(main.betChips.chipDelayFlyingTime),
                cc.callFunc(() => dealerPayChips(mainRoomGame, winBetItems)),
                cc.delayTime(main.betChips.chipDelayFlyingTime),
                cc.callFunc(() => {
                    isChipStack && removeChipStack(winBetItems);
                    mainRoomGame.payChipToAllPlayers(payChipInfo);
                })
            )
        );
    }
};

const removeChipStack = (winBetItems: BetItem[]) => {
    _.forEach(winBetItems, (item) => {
        const stackNode = item.chipNode.children[0];
        stackNode && item.chipNode.removeChild(stackNode);
        stackNode?.destroy();
    });
};

export const dealerGetChips = (mainRoomGame: TableGameBaseInterface, lostBetItems: BetItem[]) => {
    _.forEach(lostBetItems, (item) => {
        mainRoomGame.betChips.moveChips(item.chipNode, mainRoomGame.dealerChipBox);
    });
};

export const dealerPayChips = (mainRoomGame: TableGameBaseInterface, winBetItems: BetItem[]) => {
    _.forEach(winBetItems, (item) => {
        mainRoomGame.betChips.payChipsToWinningBetItem(item.chipNode, mainRoomGame.dealerChipBox);
    });
};

export const payChipsToLoginPlayer = (info: PayChipInfo, isOtherPlayers = true) => {
    const { mainRoomGame } = info;
    const statusData = mainRoomGame.getCurrentStatusData();
    if (!statusData || !statusData.win) {
        return;
    }

    const winningByChoices = statusData.winningByChoices;
    if (isOtherPlayers) {
        moveChipWithRandomAmountToLoginPlayer(info, winningByChoices);
    } else {
        moveChipWithAmountToLoginPlayer(info, winningByChoices);
    }
};

export const showPayoutForLoginPlayer = (mainRoomGame: TableGameBaseInterface) => {
    const statusData = mainRoomGame.getCurrentStatusData();
    payoutLoginPlayer(mainRoomGame, statusData);
};

export const payoutLoginPlayer = (mainRoomGame: TableGameBaseInterface, statusData) => {
    if (!statusData || !statusData.win) {
        return;
    }
    mainRoomGame.showWinningBet(statusData.bet);
    const playerNode = mainRoomGame.userProfile?.userAvatar?.node?.parent;
    playerNode && playWinningEffect(mainRoomGame, playerNode, 3);
    mainRoomGame.updateUserBalance();
};

const checkNeedShowPayoutIfDelayEndgame = (mainRoomGame: any) => {
    if (!mainRoomGame.usingNewSettlement || mainRoomGame.inSettlementSequence) {
        return false;
    }
    return mainRoomGame.gameData.durations.isWaiting();
};

export const onReceiveLoginPlayerStatus = (mainRoomGame: any) => (statusData) => {
    if (checkNeedShowPayoutIfDelayEndgame(mainRoomGame)) {
        payoutLoginPlayer(mainRoomGame, statusData);
    }
};

export const onReceiveOthersStatus = (mainRoomGame: any) => (winningPlayers) => {
    if (checkNeedShowPayoutIfDelayEndgame(mainRoomGame)) {
        showWinningEffectForPlayers(mainRoomGame, winningPlayers);
        mainRoomGame.gameData.settlement.clearWinnersData();
    }
};

const moveChipWithRandomAmountToLoginPlayer = (info: PayChipInfo, winningByChoices) => {
    const { mainRoomGame, winBetItems, payChipsDuration } = info;
    const destNode = mainRoomGame?.userProfile?.userAvatar?.node;
    if (!destNode) {
        return;
    }
    _.forEach(winBetItems, (item) => {
        if (winningByChoices[item.node.name.toLowerCase()]) {
            const chipNode = !info.isChipStack ? item.chipNode : item.chipNode.children[0];
            chipNode && mainRoomGame.betChips.moveChipsWithRandomAmount(chipNode, destNode, payChipsDuration);
        }
    });
};

const moveChipWithAmountToLoginPlayer = (info: PayChipInfo, winningByChoices) => {
    const { mainRoomGame, winBetItems } = info;
    const destNode = mainRoomGame?.userProfile?.userAvatar?.node;
    if (!destNode) {
        return;
    }
    const betItemLowercaseObjectKeys = getLowercaseObjectKeys(winningByChoices);
    _.forEach(winBetItems, (item) => {
        if (winningByChoices[betItemLowercaseObjectKeys[item.node.name.toLowerCase()]]) {
            const chipNode = !info.isChipStack ? item.chipNode : item.chipNode.children[0];
            chipNode && mainRoomGame.betChips.moveChips(chipNode, destNode);
        }
    });
};

export const payChipsToOtherPlayers = (info: PayChipInfo) => {
    const { mainRoomGame, winBetItems } = info;
    if (!mainRoomGame.otherPlayers) {
        return;
    }

    _.forEach(winBetItems, (item) => {
        const chipNode = !info.isChipStack ? item.chipNode : item.chipNode.children[0];
        chipNode && mainRoomGame.betChips.moveChips(chipNode, mainRoomGame.otherPlayers);
    });
};

export const payChipsToInGamePlayers = (info: PayChipInfo) => {
    const { mainRoomGame } = info;
    let winningPlayers = info.winningPlayers;

    if (mainRoomGame.gameData) {
        if (mainRoomGame.gameData.settlement?.winningPlayers) {
            winningPlayers = mainRoomGame.gameData.settlement.winningPlayers;
            mainRoomGame.gameData.settlement.clearWinnersData();
        }
    } else {
        if (mainRoomGame.winnersData) {
            winningPlayers = mainRoomGame.winnersData;
            mainRoomGame.winnersData = null;
        }
    }
    handleWinningPlayers(info, winningPlayers);
};

function handleWinningPlayers(info: PayChipInfo, winningPlayers: any) {
    const { mainRoomGame, winBetItems, payChipsDuration, winningDuration } = info;
    if (!winningPlayers) {
        return;
    }

    const winningPlayerIds = Object.keys(winningPlayers);

    _.forEach(winningPlayerIds, (playerId) => {
        const playerSlot = mainRoomGame.getPlayerSlot(playerId);
        if (!playerSlot) {
            return;
        }

        const winningPlayerData = winningPlayers[playerId];
        const playerBetItems = winningPlayerData.winningByChoices;
        const { bet, rate } = winningPlayerData;

        _.forEach(winBetItems, (item) => {
            if (playerBetItems && playerBetItems[item.node.name.toLowerCase()] > 0) {
                const chipNode = !info.isChipStack ? item.chipNode : item.chipNode.children[0];
                chipNode && mainRoomGame.betChips.moveChipsWithRandomAmount(chipNode, playerSlot.avatar.node, payChipsDuration);
            }
        });
        showWinningEffectForPlayerSlot(playerSlot, bet, rate, winningDuration, mainRoomGame);
    });
}

function showWinningEffectForPlayerSlot(
    playerSlot: any,
    bet: any,
    rate: any,
    winningDuration: number,
    mainRoomGame: TableGameBaseInterface
) {
    playerSlot.increaseBalance(bet);
    const convertValue = GameUtils.getValueByCurrency(bet, rate || 1);
    GameUtils.addFlyingText(playerSlot.node, true, convertValue, winningDuration, 0, 10);
    playWinningEffect(mainRoomGame, playerSlot.node, winningDuration);
}

export const showWinningEffectForPlayers = (mainRoomGame, winningPlayers) => {
    if (!winningPlayers || typeof winningPlayers !== "object") {
        return;
    }

    const winningPlayerIds = Object.keys(winningPlayers);

    if (!winningPlayerIds.length) {
        return;
    }

    const winningDuration = 3;
    _.forEach(winningPlayerIds, (playerId) => {
        const playerSlot = mainRoomGame.getPlayerSlot(playerId);
        if (!playerSlot) {
            return;
        }

        const winningPlayerData = winningPlayers[playerId];
        const { bet, rate } = winningPlayerData;
        showWinningEffectForPlayerSlot(playerSlot, bet, rate, winningDuration, mainRoomGame);
    });
};

export const playWinningEffect = (mainRoomGame: TableGameBaseInterface, playerNode: cc.Node, duration: number) => {
    const winningEffect = cc.instantiate(mainRoomGame.winningPlayerEffectPrefab);
    winningEffect.name = "winningEffect";
    playerNode.addChild(winningEffect);
    const animation = winningEffect.getComponent(cc.Animation);

    winningEffect.runAction(
        cc.sequence(
            cc.callFunc(() => {
                animation.play();
            }),
            cc.delayTime(duration), // 2 * animation.defaultClip.duration, should be multiple of duration to fix animation disappear suddenly
            cc.callFunc(() => {
                winningEffect.destroy();
            })
        )
    );
};

export const dealerGetChipsMiniGame = (main: any, settlementResult: any, statusData: any, ownBets: any) => {
    if (!appManager.GAME_IS_SHOWED) {
        return;
    }
    const settlementResultKeys = getLowercaseObjectKeys(settlementResult);
    const lostBetItems = _.filter(main.betItems, (item) => !settlementResult[settlementResultKeys[item.node.name.toLowerCase()]]);
    const status = { ...statusData };
    const roundId = main?.gameData?.roundId;
    cc.tween(main.node)
        .delay(main.betChips.chipDelayFlyingTime)
        .call(() => {
            main.gameData.settlement.showStatus();
            dealerGetChips(main, lostBetItems);
        })
        .delay(main.betChips.chipDelayFlyingTime)
        .call(() => {
            payChipToLoginPlayerMiniGame(main, status, ownBets, roundId);
        })
        .start();
};

const payChipToLoginPlayerMiniGame = (main: any, statusData: any, ownBets: any, roundId: number) => {
    if (!statusData || !statusData.win || main?.gameData?.roundId !== roundId) {
        return;
    }
    const betItems = statusData.winningByChoices;
    const betItemLowercaseObjectKeys = getLowercaseObjectKeys(betItems);
    const filteredItems = main.betItems.filter((item) => betItems[betItemLowercaseObjectKeys[item.node.name.toLowerCase()]]);

    filteredItems.forEach((item) => {
        const totalWinBet = statusData?.reachMaxWin && statusData.reachMaxWin ? statusData.bet : betItems[item.node.name];
        main.betChips.payChipsToWinningBetItemWithAmount(item.chipNode, main.dealerChipBox, totalWinBet - ownBets[item.node.name]);
    });
};

export const collectChipsLost = (main: any, settlementResult: any) => {
    const settlementResultKeys = getLowercaseObjectKeys(settlementResult);
    const lostBetItems = _.filter(main.betItems, (item) => !settlementResult[settlementResultKeys[item.node.name.toLowerCase()]]);

    lostBetItems.forEach((item) => {
        item.clearChips();
    });
};

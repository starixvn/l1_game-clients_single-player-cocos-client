import * as _ from "lodash";

import { getLowercaseObjectKeys } from "../../../common/helpers/ObjectHelper";
import IGameBase from "../IGameBase";
import RoomPlayer from "../view-models/RoomPlayer";
import DataHandler from "./DataHandler";

export default class GameBaseBetHandler implements DataHandler {
    protected playerChips = [];
    constructor(protected readonly main: IGameBase) {}

    handle(data: any) {
        if (this.main.isStopGame || this.main.isDisableGame) {
            return;
        }

        if (data.totalBets || data.ownBets) {
            this.main.betItems.forEach((item) => item.setData(data));
        }

        this.handleEndBet(data);

        if (this.main.gameConfigs) {
            this.handleChipInMainRoom(data);
        }
    }

    handleEndBet(data: any) {
        if (data.endBet) {
            data.endBet !== -1 && this.main.showAcceptedBet(data.endBet); //endCuoc -1 is error
            this.main.showProcessingWarning(false);
        }
    }

    handleChipInMainRoom(data: any) {
        const mainRoomGame = this.main;
        if (mainRoomGame && mainRoomGame.enablePlaceChips) {
            if (data.ownChip) {
                this.placeOwnChip(data.ownChip);
            }

            if (data.playerChip) {
                this.handlePlayerChipAction(data);
            }

            if (data.chips && data.remainingTime < mainRoomGame.config.betTime) {
                this.placeTotalChips(data.chips);
            }
        }
    }

    handlePlayerChipAction(data: any) {
        this.playerChips.push(data.playerChip);

        if (!this.main.node.activeInHierarchy) {
            this.placePlayerChip(data.playerChip);
        } else {
            let delayTime = 0;

            if (this.main.currentTimeRemaining >= this.main.config.stopBetTime + 2) {
                delayTime = this.playerChips.length * 0.07;
            } else {
                delayTime = this.playerChips.length * 0.01;
            }
            this.main.node.runAction(
                cc.sequence(
                    cc.delayTime(delayTime > 1 ? delayTime / 2 : delayTime),
                    cc.callFunc(() => this.placePlayerChip(data.playerChip))
                )
            );
        }
    }

    placeOwnChip(data: any) {
        const betOption = data.box.toLowerCase();
        const bet = data.bet;
        const betItem = _.find(this.main.betItems, (item) => item.node.name.toLowerCase() === betOption);

        this.main.betChips.placeChipToChipBox(bet, betItem.chipNode, null, null);
    }

    placePlayerChip(data: any) {
        // placePlayerChip
    }

    updatePlayerSlotDataStorage(data: any, playerSlot: any) {
        playerSlot.setBalance(data.red);
        playerSlot.data.idleCount = 0;
        RoomPlayer.storePlayerToCache(playerSlot.data, this.main.gameName);
    }

    updateOtherDataStorage(data: any) {
        const gameRoomMain = this.main;
        const player = gameRoomMain.playerHandler?.otherPlayers[data.playerId];

        if (player) {
            player.idleCount = 0;
            player.red = data.red;
            gameRoomMain.playerHandler.otherPlayers[data.playerId] = player;
            RoomPlayer.storePlayerToCache(player, this.main.gameName);
        }
    }

    placeTotalChips(dataChips: any) {
        if (!dataChips) {
            return;
        }

        Object.keys(dataChips).forEach((rate) => {
            const chips = dataChips[rate];
            const chipsKeys = getLowercaseObjectKeys(chips);

            _.forEach(this.main.betItems, (item) => {
                const betItemData = chips[chipsKeys[item.node.name.toLowerCase()]];
                this.main.betChips.addChipsToChipBox(+rate, betItemData, item.chipNode);
            });
        });
    }
}

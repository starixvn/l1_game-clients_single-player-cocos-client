import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { StorageManager } from "../../../managers/StorageManager";
import { ComponentSystem, ICashSystem, ICreditSystem } from "../../../System";

const { ccclass, property } = cc._decorator;

export interface PlayerData {
    id: string;
    red: any;
    name: string;
    avatarId: string;
    type: boolean;
    idleCount: number;
    rate?: number;
}

@ccclass
export default class RoomPlayer extends ComponentSystem implements ICreditSystem, ICashSystem {
    @property(cc.Label)
    nickname: cc.Label = null;

    @property(cc.Label)
    balance: cc.Label = null;

    @property(cc.Sprite)
    avatar: cc.Sprite = null;

    data: PlayerData;

    static readonly MAX_IDLE_COUNT: number = 2;
    MAX_BALANCE_DISPLAY: number;

    customizeCredit(): void {
        this.MAX_BALANCE_DISPLAY = 9999;
    }

    customizeCash(): void {
        this.MAX_BALANCE_DISPLAY = 99999;
    }

    get isIdle() {
        return this.data.idleCount > RoomPlayer.MAX_IDLE_COUNT;
    }

    setInfo(data) {
        this.node.active = true;
        this.node.opacity = 0;

        if (data) {
            this.data = data;
            this.node.runAction(cc.fadeTo(1, 255));
            this.setBalance(data.red);
            this.setAvatar(data.avatarId);

            if (data.name) {
                this.nickname.string = data.name.length > 8 ? `${data.name.substring(0, 7)}...` : data.name;
            }
        } else {
            this.data = null;
            this.node.runAction(cc.fadeTo(1, 0));
        }
    }

    setBalance(balance: number) {
        this.data.red = balance ? balance : 0;
        this.displayBalance(this.data.red);
    }

    increaseBalance(money: number) {
        if (money) {
            this.data.red += money;
            this.displayBalance(this.data.red);
        }
    }

    displayBalance(balance: number) {
        const convertValue = GameUtils.getValueByCurrency(balance, this.data.rate);
        this.balance.string =
            convertValue > this.MAX_BALANCE_DISPLAY ? `${numberWithCommas(this.MAX_BALANCE_DISPLAY)}+` : numberWithCommas(convertValue, 2);
    }

    setAvatar(avatarId) {
        GameUtils.getAvatarSprite(avatarId).then((frame) => {
            if (this.avatar && frame) {
                this.avatar.spriteFrame = frame;
            }
        });
    }

    static getGamePlayersCache(gameName) {
        return StorageManager.get(this.playersCacheKey(gameName)) ?? {};
    }

    static storePlayerToCache(playerData: PlayerData, gameName: string) {
        if (playerData.type) {
            return;
        }

        const players = RoomPlayer.getGamePlayersCache(gameName);
        players[playerData.id] = playerData;
        StorageManager.set(this.playersCacheKey(gameName), players);
    }

    static getPlayerFromCache(playerId: string, gameName: string) {
        const players = RoomPlayer.getGamePlayersCache(gameName);
        return players[playerId];
    }

    private static playersCacheKey(gameName: string) {
        return `PLAYERS_${gameName}`;
    }
}

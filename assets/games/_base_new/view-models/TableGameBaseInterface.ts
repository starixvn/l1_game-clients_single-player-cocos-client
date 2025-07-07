import BetChips from "../../../common/bet-chips/view-models/BetChips";
import UserProfile from "../../../common/user-profile/UserProfile";
import IGameBase from "../../_base/IGameBase";
import BetItem from "../../_base/view-models/BetItem";
import { GameData } from "../../_new/_base/game-data-management/models/game-data";

export default interface TableGameBaseInterface extends IGameBase {
    node: cc.Node;
    dealerChipBox: cc.Node;
    otherPlayers: cc.Node;
    betItems: BetItem[];
    enablePlaceChips: boolean;
    betChips: BetChips;
    userProfile: UserProfile;
    winningPlayerEffectPrefab: cc.Prefab;

    winnersData: any;
    gameData?: GameData;
    WinningAnimationDuration?: number;
    getPlayerSlot(playerId);
    getCurrentStatusData();
    payChipToAllPlayers(payChipInfo);
    showWinningBet(statusDataBet);
    updateUserBalance();
}

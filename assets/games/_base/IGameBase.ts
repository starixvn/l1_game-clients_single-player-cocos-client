import DataHandler from "./handlers/DataHandler";
import { IGameBaseMd5Handler, IGameBasePlayerHandler, IGameBaseStatusHandler, IGameBaseTimeHandler } from "./handlers/interfaces";
import { GameConfigBase } from "./view-models/GameConfigBase";

export default interface IGameBase {
    isDisableGame: boolean;
    waitingProcessing: boolean;
    finishShowResult: boolean;
    showOtherPlayerChips: boolean;
    enablePlaceChips?: boolean;
    isStopGame: boolean;
    isDonePayingChip: boolean;
    usingNewSettlement: boolean;
    inSettlementSequence: boolean;
    syncShowingMD5WithResult: boolean;
    isReceivedUMData: boolean;

    gameState: number;
    currentTimeRemaining: number;
    roundId: number;
    truthyRoundId: number;

    gameName: string;

    currentDataLogs: any[];
    boostedChoices: string[];
    betItems: any[];

    node: cc.Node;
    gameConfigs: any;
    winnersData: any;
    config: GameConfigBase;

    //components
    animatedTime: any;
    timeWaitNode: cc.Node;
    timeWaitLabel: cc.Label;
    betChips: any;
    gameAudios: any;
    md5Component: any;
    userProfile?: any;
    provablyFairComponent?: any;

    statusHandler: IGameBaseStatusHandler;
    timeHandler: IGameBaseTimeHandler;
    md5Handler: IGameBaseMd5Handler;
    playerHandler?: IGameBasePlayerHandler;

    umHandler: DataHandler;
    noticeHandler: DataHandler;
    betHandler: DataHandler;
    errorHandler: DataHandler;
    logsHandler: DataHandler;
    finishHandler: DataHandler;
    configsHandler: DataHandler;
    provablyFairHandler: DataHandler;
    oddsHandler: DataHandler;
    voidTicketHandler: DataHandler;
    winnersHandler: DataHandler;

    clearAllNotices();
    resetDataAndUI();
    sendSocketData(event: string, data: any);
    showWinningBet(value: number);
    showAcceptedBet(value: number);
    showProcessingWarning(value: boolean);
    showMiniWarning(data: any);
    setGameConfigs(data: any);
    setBoostedChoices(data: any);
    applyPromotion(data: any);
    handleProvablyFairVerifyData(data: any);
    shouldShowWinningEffect();
    updateRebetButtonStatus();
    showPayoutForLoginPlayer(data: any);
    voidTicket(data: any);
    disableGame();
    hideUmMessage();
    updateUserBalance();
    showUmMessage(data);
    checkShowUmMessage(data): boolean;
    setGameRound(value: number);
}

export default interface MiniPanelInterface {
    fontCong: cc.BitmapFont;
    fontTru: cc.BitmapFont;
    miniGames: cc.Node;
    miniMenu: cc.Node;
    dialog: cc.Node;
    effectNode: cc.Node;
    loadingPrefab: cc.Prefab;
    noticeContainer: cc.Node;
    guideContainer: cc.Node;
    activeController: any;
    promotionContainer: cc.Node;
    popupMiniGame: any;
    loading: any;
    dataHandlers: any;
    currentGameRoomId: number;
    skipShowApiErrorGameIds: number[];
    gameMiniInitializers: any;
    socketIOGameInitializers: any;
    noticePrefab: cc.Prefab;
    chartsWebView: any;
    boostedOdds: any;
    promotionAnnouncement: any;
    socketIOController: any;

    addNewLayerCallback(key: string, callback: any);

    removeNewLayerCallback(key: string);
    removeChartsWebView(key: string);

    onGamesLayerChanged();

    initPopUpMiniGames();

    registerPromotionEvents();

    createBoostedOddsNode();

    updatePositionPromotionNode();

    showBoostedOdds();

    onGeneralData(data: any);

    handleUmMessage(data, gameId);

    handleWhenNotJoinRoomGame(gameId);
    redirectToResultPage(redirectUrl);

    openResultPage(gameId: number);

    addMiniGame(game: any, gameId: number);

    getGameMini(gameId): any;
    onSignIn();

    onForceReload(showNotice, message);
    forceKickedOut();

    playClick();

    openGame(e, id);

    openMiniContainerGame(id);

    openNewSocketMiniGame(e, id);

    openNewSocketTableGame(event, gameId);
    loadGame(gameId, onComplete: () => void);

    openSocketByUrl(gameId, socketUri, onConnectCallback);

    openGatewayGame(gameId, onConnectCallback);

    loadGameRoom(name);

    createPromotionAnnouncementPrefab();
    showPromotionAnnouncements();

    createPromotionTournamentPrefab();

    showPromotionTournament();

    handleAPIError(error);

    showErrorNotice(error);

    addNotice(node: cc.Node);

    showGuide(guide: cc.Node);

    showNotice(noticeData: any, handleClickButton: () => void, handleClose: () => void);

    onConnectSocketFailed(gameName, gameId, isGameRoom);

    redirectToLobby();
    addDialog(dialogNode: cc.Node);
    setIconOverMiniGame(over: boolean);
    setLoadingVisibility(status: boolean);

    unCacheAndHideGameLoading(loadingComp: any, gameId: number);

    getGameLoadingComp(gameId: number): any;
    initNoticePrefab();
}

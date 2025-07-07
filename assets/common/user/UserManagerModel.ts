export interface IUserStakeLevel {
    minBet: number;
    maxBet: number;
}

export interface ISettings {
    quickBet: boolean;
    theme: string;
}

export class UserData {
    constructor(
        public UID = 0,
        public apiError = "",
        public availSpins = 0,
        public rate = 0,
        public name = "",
        public avatarId = 0,
        public red = 0,
        public currency = "",
        public scoins = 0,
        public fractionalOddsFormat = false,
        public isDisplayPlayerCurrency = "",
        public userStakeLevel: IUserStakeLevel = { minBet: 0, maxBet: 0 },
        public offerGames: number[] = [],
        public offerGamesIncludeSubGames: number[] = [],
        public settings: ISettings = { quickBet: false, theme: "" },
        public isSignedInSM = false,
        public type = false,
        public disableJackpotGames = true,
        public multiplier = 0,
        public currencyCode = "",
        public currencyGroup = ""
    ) {}
}

export interface AudioInfo {
    bundle: string;
    path: string;
}

export type TAudioValue = {
    bundle: string;
    path: string;
    type: string;
    isMusicGame?: boolean;
    isLazyLoad?: boolean;
};

export type TAudioConfigs = {
    [key: string]: TAudioValue;
};

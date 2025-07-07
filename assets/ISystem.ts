export interface ISystem {
    initSystem(): void;
}

export enum SystemType {
    SC1 = "SC1",
    SC2 = "SC2"
}

export enum OperatorAlias {
    SP = "SP",
    VG = "VG",
    SG = "SG",
    TIP88 = "TIP88"
}

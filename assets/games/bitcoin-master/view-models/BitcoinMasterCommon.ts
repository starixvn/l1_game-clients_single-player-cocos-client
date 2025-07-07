export enum BMBetType {
    Up = "up",
    Down = "down",
    Even = "even",
    Odd = "odd"
}

export enum BMHeaderMenu {
    UpDown = "upDown",
    EvenOdd = "evenOdd"
}

export interface BMStatisticData {
    left: BMStatisticItemData;
    right: BMStatisticItemData;
}

export interface BMStatisticItemData {
    name: string;
    value: number;
}

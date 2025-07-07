import { ICashSystem, ICreditSystem, System } from "../../../System";

export default class BetBoardConfig extends System implements ICreditSystem, ICashSystem {
    shortenValue: boolean;

    customizeCash(): void {
        this.shortenValue = true;
    }
    customizeCredit(): void {
        this.shortenValue = false;
    }
}

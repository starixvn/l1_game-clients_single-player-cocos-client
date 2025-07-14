import { injectable } from "inversify";

import { ICashSystem, ICreditSystem, System } from "../../../System";

@injectable()
export default class BlackJackConfig extends System implements ICreditSystem, ICashSystem {
    constructor() {
        super();
    }

    chipOption: number[];

    customizeCredit(): void {
        this.chipOption = [0.5];
    }

    customizeCash(): void {
        this.chipOption = [5];
    }
}

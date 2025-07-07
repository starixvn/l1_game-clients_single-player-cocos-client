import { freeSpinsPromotionHandler } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import IGameBase from "../IGameBase";
import DataHandler from "./DataHandler";

export default class GameFreeSpinsPromotionHandler implements DataHandler {
    constructor(protected readonly main: IGameBase) {}

    handle(data: any) {
        if (!data.promotionInfo) {
            return;
        }

        freeSpinsPromotionHandler.setPromotionInfoFromSso(data.promotionInfo);
        
    }
}

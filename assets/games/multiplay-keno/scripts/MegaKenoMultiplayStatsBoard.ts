import MultiplayTableGameStatisticBoard from "../../../common/statistic-board/MultiplayTableGameStatisticBoard";
import { MegaKeno1Id, MegaKeno2Id, MegaKeno3Id, MegaKeno4Id, MegaKeno5Id, MegaKeno6Id, MegaKeno7Id, MegaKeno8Id } from "./MegaKenoConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaKenoMultiplayStatsBoard extends MultiplayTableGameStatisticBoard {
    gameIds = [MegaKeno1Id, MegaKeno3Id, MegaKeno2Id, MegaKeno4Id, MegaKeno5Id, MegaKeno7Id, MegaKeno6Id, MegaKeno8Id];
}

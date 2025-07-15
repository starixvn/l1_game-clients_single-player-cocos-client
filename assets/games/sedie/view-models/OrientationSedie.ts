import MultiOrientationControl from "../../_base/MultiOrientationControl";
import { SedieId } from "./Sedie";

const { ccclass } = cc._decorator;

@ccclass
export default class OrientationSedie extends MultiOrientationControl {
    onLoad() {
        this.gameId = SedieId;
        super.onLoad();
    }
}

import SlotGameSongs from "./SlotGameSongs";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardSlotGameSongs extends SlotGameSongs {
    protected musicDirectory = "/background-music";
}

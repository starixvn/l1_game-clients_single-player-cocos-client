import _ = require("lodash");

import { systemType } from "../../configs/Configs";
import { SystemType } from "../../ISystem";

export default class NameSongManager {
    private _songs = {};

    set songs(data: any) {
        this._songs = data;
    }

    constructor(data: any) {
        this._songs = data;
    }

    public getSongName() {
        if (this._songs[systemType]) {
            return this.getRandomName(this._songs[systemType]);
        }

        return this.getRandomName(this._songs[SystemType.SC1]);
    }

    private getRandomName(songs: string[]) {
        if (songs.length < 2) {
            return songs[0] || "";
        }
        return songs[_.random(songs.length - 1)];
    }
}

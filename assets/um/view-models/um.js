import i18n from "i18n/runtime-scripts/LanguageData";

import { appContainer } from "../../Application";
import MusicPlayer from "../../common/audio/MusicPlayer";
import SocketIOController from "../../SocketIOController";

console.log("[UM] Loading UM module...");

const socketIOController = appContainer.get(SocketIOController);
console.log("[UM] SocketIOController retrieved from app container");

cc.Class({
    extends: cc.Component,

    properties: {
        message: cc.Label
    },

    onLoad() {
        console.log("[UM] UM component onLoad called");

        if (window.umInfo) {
            console.log("[UM] Maintenance info found:", window.umInfo);
            if (this) {
                console.log("[UM] Processing maintenance time...");
                const template = "hh:mm dd/MM/yyyy";
                const startTime = this.formatDate(this.convertToGMT8(new Date(umInfo.startTime)), template);
                const endTime = this.formatDate(this.convertToGMT8(new Date(umInfo.endTime)), template);

                console.log("[UM] Formatted start time:", startTime);
                console.log("[UM] Formatted end time:", endTime);

                const message = i18n.t("ui.maintain_time", { startTime: startTime, endTime: endTime });
                console.log("[UM] Generated maintenance message:", message);
                this.message.string = message;
                console.log("[UM] Message set to label");
            } else {
                console.warn("[UM] Component not available for maintenance info");
            }
        } else {
            console.log("[UM] No maintenance info found");
        }

        if (window.reCheckInId) {
            console.log("[UM] Clearing existing reCheckInId interval");
            clearInterval(window.reCheckInId);
        } else {
            console.log("[UM] No existing reCheckInId interval found");
        }

        console.log("[UM] Closing all socket connections...");
        socketIOController.closeAllSocket();
        console.log("[UM] All socket connections closed");

        console.log("[UM] Stopping background audio...");
        MusicPlayer.getInstance().stopBackgroundAudio();
        console.log("[UM] Background audio stopped");

        console.log("[UM] UM component onLoad completed");
    },

    convertToGMT8(date) {
        console.log("[UM] Converting date to GMT+8:", date);
        const convertedDate = new Date(
            date.toLocaleString("en-US", {
                timeZone: "Asia/Manila"
            })
        );
        console.log("[UM] Converted date:", convertedDate);
        return convertedDate;
    },

    formatDate(date, template) {
        console.log("[UM] Formatting date:", date, "with template:", template);
        try {
            var z = {
                M: date.getMonth() + 1,
                d: date.getDate(),
                h: date.getHours(),
                m: date.getMinutes(),
                s: date.getSeconds()
            };
            console.log("[UM] Date components:", z);

            template = template.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
                return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2);
            });

            const result = template.replace(/(y+)/g, function (v) {
                return date.getFullYear().toString().slice(-v.length);
            });

            console.log("[UM] Formatted date result:", result);
            return result;
        } catch (ex) {
            console.error("[UM] Error formatting date:", ex);
            console.log(ex);
            return date.toString();
        }
    }
});

console.log("[UM] UM module loaded successfully");

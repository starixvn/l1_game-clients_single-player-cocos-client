"use strict";

const Fs = require("fs");

Editor.Panel.extend({
    style: `
        :host { display: flex; flex-direction: column; padding: 10px; }
        h2 { color: #666; margin-bottom: 10px; }
        .info { color: #666; margin-bottom: 15px; line-height: 1.5; }
        button { height: 30px; width: 150px; }
    `,

    template: `
        <h2>TTF to WOFF2 Tool</h2>
        <div class="info">
            This plugin will automatically convert TTF fonts to WOFF2 format after building for the web-mobile platform.
            <br><br>
            You can also click the button below to manually convert fonts:
        </div>
        <button id="convert-btn">Convert TTF to WOFF2</button>
    `,

    ready() {
        this.$convertBtn = this.shadowRoot.querySelector("#convert-btn");

        this.$convertBtn.addEventListener("click", () => {
            Editor.log("[Font Conversion] Starting manual conversion...");
            Editor.Ipc.sendToMain("woff2-cvt:convert");
        });
    },

    messages: {
        "panel:ready"() {
            // Panel ready
        }
    }
});

import * as i18n from "i18n/runtime-scripts/LanguageData";

import StringUtil from "../utils/StringUtil";
import { FormationHandler } from "./FormationHandler";

const LocalizedLabel = require("LocalizedLabel");

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedLabelWithFormat")
export default class LocalizedLabelWithFormat extends LocalizedLabel {
    @property({ type: cc.Enum(FormationHandler) })
    format = FormationHandler.UPPER;

    @property()
    suffix = "";

    public dataId: string;

    updateLabel() {
        if (!this.label) {
            this.label = this.node.getComponent(cc.Label);

            if (!this.label) {
                cc.error("Failed to update localized label, label component is invalid!");
                return;
            }
        }
        let localizedString = i18n.t(this.dataId);
        if (localizedString) {
            localizedString = StringUtil.formatText(localizedString, this.format);
            if (this.suffix.length > 0) {
                localizedString += this.suffix;
            }
            this.label.string = localizedString;
        }
    }
}

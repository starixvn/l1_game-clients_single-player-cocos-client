const { ccclass, property } = cc._decorator;

const LocalizedPositionData = cc.Class({
    name: "LocalizedPositionData",
    properties: {
        language: "",
        node: cc.Node
    }
});

@ccclass
export default class LocalizedPosition extends cc.Component {
    @property({ type: LocalizedPositionData })
    data = [];

    onLoad() {
        const lang = window.i18n.curLang;
        this.data.forEach((data) => {
            if (data.language === lang) {
                this.node.position = data.node.position;
            }
        });
    }
}

const { ccclass, property } = cc._decorator;

const LocalizedPositionData = cc.Class({
    name: "LocalizedPositionV2Data",
    properties: {
        language: "",
        offset: cc.Vec2
    }
});

@ccclass
export default class LocalizedPosition2 extends cc.Component {
    @property({ type: LocalizedPositionData })
    data = [];

    onLoad() {
        const lang = window.i18n.curLang;
        this.data.forEach((data) => {
            if (data.language === lang) {
                this.node.position = cc.v3(this.node.position.x, this.node.position.y).add(cc.v3(data.offset.x, data.offset.y));
            }
        });
    }
}

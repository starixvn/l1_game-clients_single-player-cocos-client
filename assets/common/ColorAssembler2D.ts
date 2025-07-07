// author: http://lamyoung.com/

const { ccclass, property, executeInEditMode, requireComponent, menu } = cc._decorator;

@ccclass
@executeInEditMode
@requireComponent(cc.RenderComponent)
@menu("i18n:MAIN_MENU.component.renderers/ColorAssembler2D-lamyoung.com")
export default class ColorAssembler2D extends cc.Component {
    @property
    private _colors: cc.Color[] = [];
    @property({ type: [cc.Color] })
    public get colors() {
        return this._colors;
    }
    public set colors(colors) {
        this._colors = colors;
        this.updateColors();
    }
    onLoad() {
        this.node.on(cc.Node.EventType.SCALE_CHANGED, this.updateColors, this);
    }

    onEnable() {
        cc.director.once(cc.Director.EVENT_AFTER_DRAW, this.updateColors, this);
    }

    onDisable() {
        cc.director.off(cc.Director.EVENT_AFTER_DRAW, this.updateColors, this);
        this.node["_renderFlag"] |= cc["RenderFlow"].FLAG_COLOR;
    }

    updateColors() {
        const cmp = this.getComponent(cc.RenderComponent);
        if (!cmp) {
            return;
        }
        const _assembler = cmp["_assembler"];
        if (!(_assembler instanceof cc["Assembler2D"])) {
            return;
        }
        const uintVerts = _assembler._renderData.uintVDatas[0];
        if (!uintVerts) {
            return;
        }
        const color = this.node.color;
        const floatsPerVert = _assembler.floatsPerVert;
        const colorOffset = _assembler.colorOffset;
        let count = 0;
        for (let i = colorOffset, l = uintVerts.length; i < l; i += floatsPerVert) {
            uintVerts[i] = (this.colors[count] || color)["_val"];
            count++;
        }
    }
}
// 欢迎关注微信公众号[白玉无冰]

/**
█████████████████████████████████████
█████████████████████████████████████
████ ▄▄▄▄▄ █▀█ █▄██▀▄ ▄▄██ ▄▄▄▄▄ ████
████ █   █ █▀▀▀█ ▀▄▀▀▀█▄▀█ █   █ ████
████ █▄▄▄█ █▀ █▀▀▀ ▀▄▄ ▄ █ █▄▄▄█ ████
████▄▄▄▄▄▄▄█▄▀ ▀▄█ ▀▄█▄▀ █▄▄▄▄▄▄▄████
████▄▄  ▄▀▄▄ ▄▀▄▀▀▄▄▄ █ █ ▀ ▀▄█▄▀████
████▀ ▄  █▄█▀█▄█▀█  ▀▄ █ ▀ ▄▄██▀█████
████ ▄▀▄▄▀▄ █▄▄█▄ ▀▄▀ ▀ ▀ ▀▀▀▄ █▀████
████▀ ██ ▀▄ ▄██ ▄█▀▄ ██▀ ▀ █▄█▄▀█████
████   ▄██▄▀ █▀▄▀▄▀▄▄▄▄ ▀█▀ ▀▀ █▀████
████ █▄ █ ▄ █▀ █▀▄█▄▄▄▄▀▄▄█▄▄▄▄▀█████
████▄█▄█▄█▄█▀ ▄█▄   ▀▄██ ▄▄▄ ▀   ████
████ ▄▄▄▄▄ █▄██ ▄█▀  ▄   █▄█  ▄▀█████
████ █   █ █ ▄█▄ ▀  ▀▀██ ▄▄▄▄ ▄▀ ████
████ █▄▄▄█ █ ▄▄▀ ▄█▄█▄█▄ ▀▄   ▄ █████
████▄▄▄▄▄▄▄█▄██▄▄██▄▄▄█████▄▄█▄██████
█████████████████████████████████████
█████████████████████████████████████
 */

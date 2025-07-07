const { ccclass, property, executeInEditMode } = cc._decorator;
enum Type {
    TwoColor,
    UseTexture
}

@ccclass
@executeInEditMode
export class GradientNode extends cc.Component {
    @property(cc.Material)
    originMaterial: cc.Material = null;

    @property({ type: cc.Enum(Type) })
    type = Type.TwoColor;

    @property({
        type: cc.Texture2D,
        visible: function (this: GradientNode) {
            return this.type === Type.UseTexture;
        }
    })
    albedoTexture: cc.Texture2D = null;

    @property({
        visible: function (this: GradientNode) {
            return this.type === Type.TwoColor;
        }
    })
    topColor: cc.Color = new cc.Color();

    @property({
        visible: function (this: GradientNode) {
            return this.type === Type.TwoColor;
        }
    })
    bottomColor: cc.Color = new cc.Color();

    onLoad() {
        this.changeMaterial();
    }

    private changeMaterial() {
        if (!this.originMaterial) {
            return;
        }

        const renderComponent = this.getComponent(cc.RenderComponent);
        if (renderComponent) {
            renderComponent.setMaterial(0, this.originMaterial);
            const useTexture = this.type === Type.UseTexture;

            const material = renderComponent.getMaterial(0);
            material.setProperty("type", useTexture ? 1.0 : 0.0);

            if (useTexture) {
                this.albedoTexture && material.setProperty("albedoTexture", this.albedoTexture);
            } else {
                material.setProperty("topColor", this.topColor);
                material.setProperty("bottomColor", this.bottomColor);
            }
        }
    }

    onFocusInEditor() {
        this.changeMaterial();
    }
}

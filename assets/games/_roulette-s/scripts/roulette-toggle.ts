const {ccclass, property} = cc._decorator;

export enum RouletteToggleType {
    Name = 0,
    Avatar = 1
}

@ccclass
export default class RouletteToggle extends cc.Component {
    @property(cc.Sprite)
    toggleSprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    toggleOnFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    toggleOffFrame: cc.SpriteFrame = null;

    @property({ type: cc.Enum(RouletteToggleType) })
    type = RouletteToggleType.Name;

    private isEnabled = false;
    private onToggleCallback: (type: RouletteToggleType, enabled: boolean) => void = null;

    onLoad() {
        this.node.on("click", this.onToggleClick, this);
    }

    onDestroy() {
        this.node.off("click", this.onToggleClick, this);
    }

    private onToggleClick() {
        this.isEnabled = !this.isEnabled;
        this.updateIcon(this.isEnabled);
        
        if (this.onToggleCallback) {
            this.onToggleCallback(this.type, this.isEnabled);
        }
    }

    public setToggleCallback(callback: (type: RouletteToggleType, enabled: boolean) => void) {
        this.onToggleCallback = callback;
    }

    public updateIcon(enabled: boolean) {
        if (!this.isValid || !this.toggleSprite) {
            return;
        }
        this.isEnabled = enabled;
        this.toggleSprite.spriteFrame = enabled ? this.toggleOnFrame : this.toggleOffFrame;
    }

    public getIsEnabled(): boolean {
        return this.isEnabled;
    }

    public setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
        this.updateIcon(enabled);
    }
}

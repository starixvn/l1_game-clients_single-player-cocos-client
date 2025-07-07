const { ccclass, property } = cc._decorator;

@ccclass
export default class FavoriteButton extends cc.Component {
    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    onFavoriteChanged: (favorite: boolean) => void;

    setFavorite(favorite: boolean) {
        this.toggle.isChecked = favorite;
    }

    initListener() {
        this.toggle.node.on("toggle", this.favoriteChanged, this);
    }

    favoriteChanged() {
        if (this.onFavoriteChanged) {
            this.onFavoriteChanged(this.toggle.isChecked);
        }
    }
}

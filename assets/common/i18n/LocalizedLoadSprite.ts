import { BundleManager } from "bundle-management";

import { getGameConfiguration } from "../../configs/GameConfigurations";

const { ccclass, property, menu, executeInEditMode } = cc._decorator;
const pathRoot = "image";

@ccclass
@executeInEditMode
@menu("i18n/LocalizedLoadSprite")
export default class LocalizedLoadSprite extends cc.Component {
    @property()
    gameId = 0;

    @property()
    nameImage = "";

    @property
    enableCustomizePath = false;

    @property({
        visible: function (this: LocalizedLoadSprite) {
            return this.enableCustomizePath;
        }
    })
    customizePath = "";

    @property({
        visible: function (this: LocalizedLoadSprite) {
            return this.enableCustomizePath;
        }
    })
    isLoadShareResource = false;

    @property
    prefix = "images";

    protected sprite: cc.Sprite;

    onLoad() {
        this.fetchRender();
    }

    public fetchRender() {
        const sprite = this.getComponent(cc.Sprite);
        if (sprite) {
            this.sprite = sprite;
            this.updateSprite({ language: window.i18n.curLang, name: this.nameImage, gameId: this.gameId });
        }
    }

    public async getSpriteFrameByLang(lang: string, name: string, gameId: number) {
        const gameConfiguration = getGameConfiguration(gameId);
        const loadFromResources = () => {
            const path = this.enableCustomizePath
                ? `${this.customizePath}/${lang}${this.gameId > 0 ? `/${gameId}` : ""}/${name}`
                : `${pathRoot}/${lang}/${gameId}/${name}`;

            return new Promise<cc.SpriteFrame>((resolve) => {
                cc.resources.load<cc.SpriteFrame>(path, cc.SpriteFrame, (err, spriteFrame) => {
                    resolve(spriteFrame);
                });
            });
        };

        if ((gameConfiguration && !gameConfiguration.remoteBundle) || this.isLoadShareResource) {
            return loadFromResources();
        } else {
            const bundleManager = BundleManager.getInstance();
            const path = `i18n/${this.prefix}/${lang}/${name}`;
            const devPath = `../games/*/${path}`;

            try {
                const sprite = await bundleManager.loadAsset<cc.SpriteFrame>({
                    type: cc.SpriteFrame,
                    bundleId: `${gameId}`,
                    path,
                    pathForDevMode: devPath
                });

                return sprite;
            } catch (error) {
                // Retry to load from resources
                return loadFromResources();
            }
        }
    }

    async updateSprite({ language, name, gameId }) {
        if (!this.sprite) {
            if (this.node.activeInHierarchy) {
                cc.error("Failed to update localized sprite, sprite component is invalid!");
            }
            return;
        }

        const spriteFrame = await this.getSpriteFrameByLang(language, name, gameId);
        if (!this || !this.isValid || !this.node.isValid) {
            return;
        }
        this.sprite.spriteFrame = spriteFrame;
    }
}

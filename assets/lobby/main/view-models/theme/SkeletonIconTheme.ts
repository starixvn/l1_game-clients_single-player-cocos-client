import { FormationHandler } from "../../../../common/i18n/FormationHandler";
import StringUtil from "../../../../common/utils/StringUtil";
import { uiManager } from "../../../../managers/GameUIManager";
import { lobbyResourceManager } from "../LobbyResourceManager";
import GameNotification from "./../GameNotification";
import JackpotPoolInfo from "./../JackpotPoolInfo";
import SkeletonIcon from "./../SkeletonIcon";
import { themeGameIconLoader } from "./GameIconLoader";
import { themeGameNameManager } from "./GameNameManager";
import { themeResourceLoader } from "./ResourceLoader";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkeletonIconTheme extends SkeletonIcon {
    @property({ type: cc.Node, override: true, visible: false })
    lightTop: cc.Node = null;

    @property(JackpotPoolInfo)
    jackpotPoolInfo: JackpotPoolInfo = null;

    override setGameName(text: string, gameId: number, formatGameName: FormationHandler) {
        const gameName = this.getGameNamesBreakLine(gameId, text);
        this.gameName.node.active = true;
        this.gameName.string = lobbyResourceManager?.infoShareResource?.ignoreCapitalizeGameNames?.includes(gameId)
            ? gameName
            : StringUtil.formatText(gameName, formatGameName);
        this.handleFontSize(gameId);
    }

    override setGameContent(id: number, gameIconIndex: number, categoryIndex: number, addListIconObscure: (icon: SkeletonIcon) => void) {
        if (!!uiManager.spriteFrameCache.lobbyIcons[id]) {
            this.loadAnimation(id, categoryIndex);
        } else {
            addListIconObscure(this);
        }
    }

    public override async loadAnimation(id: number, categoryIndex = 0) {
        const cachedSprite = uiManager.spriteFrameCache.lobbyIcons[id]?.spriteFrame;
        const spriteFrame = cachedSprite || (await themeGameIconLoader?.loadGameIcon(id));

        if (spriteFrame) {
            this.hideSkeleton();
            const spriteComponent = this.gameContent.getComponent(cc.Sprite);
            spriteComponent.spriteFrame = spriteFrame;
            this.updateNewTag(id, categoryIndex);
            this.setGameTypeLabel(id);
        }

        this.updateJackpotPoolInfo(id);
        this.updateReceiveNotification(id);
    }

    private updateReceiveNotification(id: number) {
        const gameNotificationComp = this.node.getComponent(GameNotification);
        gameNotificationComp && (gameNotificationComp.gameId = id);
    }

    private updateJackpotPoolInfo(id: number) {
        this.jackpotPoolInfo && (this.jackpotPoolInfo.gameId = id);
    }

    protected getGameNamesBreakLine(gameId: number, currentGameName: string): string {
        const lang = window.i18n.curLang ?? "en";
        const gameName = themeGameNameManager?.getGameNameBreakLine(gameId, lang);

        return gameName ?? currentGameName;
    }

    protected handleFontSize(gameId: number) {
        const lang = window.i18n.curLang ?? "en";
        const fontSize = themeGameNameManager?.getGameNamesFontSize(gameId, lang);

        if (fontSize && fontSize > 0) {
            this.gameName.fontSize = fontSize;
        }
    }

    protected async setGameTypeLabel(gameId: number) {
        const lang = window.i18n.curLang ?? "en";
        const labelGameType = themeGameNameManager?.getLabelGameType(gameId);
        if (labelGameType) {
            this.lblGameType.active = true;
            try {
                const version = lobbyResourceManager.infoShareResource["versionGameIcon"];
                const resourcePath = `game-icons/${gameId}/${labelGameType.gameType}/${lang}.png?v=${version}`;
                const remoteTexture = await themeResourceLoader?.loadRemoteSharedResource<cc.Texture2D>(resourcePath);
                this.assignSpriteFrame(labelGameType, remoteTexture);
            } catch (error) {
                cc.log(`Not get Game} Icon from shared resource: ${gameId}`);
            }
        }
    }
}

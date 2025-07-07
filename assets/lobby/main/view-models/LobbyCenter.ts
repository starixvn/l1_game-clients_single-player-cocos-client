import AudioManager from "../../../common/audio/AudioManager";
import { FormationHandler } from "../../../common/i18n/FormationHandler";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import Banner from "./Banner";
import ButtonArrow from "./ButtonArrow";
import LobbyMenu from "./LobbyMenu";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyCenter extends cc.Component {
    @property(cc.ScrollView)
    mainScroll: cc.ScrollView = null;

    @property(Banner)
    banner: Banner = null;

    @property(cc.Node)
    scrollContent: cc.Node = null;

    @property({ type: cc.Enum(FormationHandler) })
    formatGameName = FormationHandler.UPPER;

    @property
    spacingIcon = 24;

    protected buttonArrowComp: ButtonArrow = null;
    protected miniPanel: MiniPanel = null;
    protected lobbyMenu: LobbyMenu;

    protected onLoad(): void {
        uiManager.emitterListener(InternalEvents.LOAD_OTHER_ICONS_AND_BANNERS, this.loadOtherIconsAndBanners.bind(this), this);
        uiManager.emitterListener(InternalEvents.OPEN_GAME_MINI, this.loadOtherIconsAndBanners.bind(this), this);
        this.initScrollListener();
        window.addEventListener("resize", this.onWindowResize.bind(this));
    }

    protected onDestroy() {
        window.removeEventListener("resize", this.onWindowResize);
        uiManager.removeListenersWithTarget(this);
    }

    onWindowResize() {
        this.buttonArrowComp?.handleScale(true);
    }

    setButtonArrowComp(buttonArrow: ButtonArrow) {
        this.buttonArrowComp = buttonArrow;
    }

    setMiniPanel(miniPanel: MiniPanel) {
        this.miniPanel = miniPanel;
    }

    initLobbyMenu() {
        let lobbyMenu = this.mainScroll.getComponent(LobbyMenu);
        if (lobbyMenu) {
            return;
        }
        lobbyMenu = this.mainScroll.addComponent(LobbyMenu);
        lobbyMenu.updateSpacing(this.spacingIcon);
        lobbyMenu.content = this.scrollContent;
        lobbyMenu.miniPanel = this.miniPanel;
        lobbyMenu.formatGameName = this.formatGameName;

        this.lobbyMenu = lobbyMenu;
        const isSSOToGame = window.openGameId && parseInt(window.openGameId) > 0;
        if (isSSOToGame) {
            this.lobbyMenu.skipLoadHiddenIcons = true;
        }
    }

    initScrollListener() {
        this.mainScroll.content.on(cc.Node.EventType.SIZE_CHANGED, () => {
            this.updateArrowVisibility();
        });
        this.mainScroll.node.on("scroll-ended", () => {
            const offset = Math.abs(Math.floor(this.mainScroll.getScrollOffset().x));
            const maxOffset = Math.floor(this.mainScroll.getMaxScrollOffset().x);

            if (offset <= 1 || offset >= maxOffset) {
                const right = offset < maxOffset;
                this.buttonArrowComp?.handleScale(right);
            }
        });
    }

    onFastScrollClick() {
        AudioManager.getInstance().playClick();

        if (this.mainScroll.content.childrenCount === 0) {
            return;
        }

        const offset = Math.abs(this.mainScroll.getScrollOffset().x);
        const maxOffset = Math.abs(this.mainScroll.getMaxScrollOffset().x);
        const direction = this.buttonArrowComp?.background?.scaleX;
        const delta = this.mainScroll.node.width;
        let newOffset = offset + direction * delta;

        const layout = this.mainScroll.content.getComponent(cc.Layout);
        const paddingLeft = layout.paddingLeft;
        const paddingRight = layout.paddingRight;
        const spacing = layout.spacingX;
        const itemSize = this.mainScroll.content.children[0].width;
        const stepWidth = itemSize + spacing;

        if (direction > 0) {
            const stepCount = Math.floor((newOffset - paddingLeft) / stepWidth);
            newOffset = paddingLeft + stepCount * stepWidth;
        } else {
            const stepCount = Math.floor((maxOffset - paddingRight - newOffset) / stepWidth);
            newOffset = maxOffset - stepCount * stepWidth;
        }

        this.mainScroll.scrollToOffset(cc.v2(newOffset, 0), 0.4);
    }

    protected loadOtherIconsAndBanners() {
        this.lobbyMenu?.loadHiddenIcons();
        this.banner?.loadBanner(true);
    }

    protected updateArrowVisibility() {
        this.buttonArrowComp?.updateArrowVisibility(this.mainScroll.content.width > this.mainScroll.node.width);
    }

    onCategoryChanged(categoryIndex: number) {
        AudioManager.getInstance().playClick();
        this.setMenuCategory(+categoryIndex);
        this.updateArrowVisibility();
    }

    setMenuCategory(index: number) {
        this.lobbyMenu?.setCategory(index);
    }

    initBanners(isLoadAllBanner: boolean) {
        this.banner?.loadBanner(isLoadAllBanner);
    }
}

import { lazyInject } from "../../../Application";
import { userManager } from "../../../common/user/UserManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import { StorageManager } from "../../../managers/StorageManager";
import CategoryItem from "../../main/view-models/CategoryItem";
import LobbyManager from "../../main/view-models/LobbyManager";
import LobbyMenuConfig from "../../main/view-models/LobbyMenuConfig";
import Category from "./Category";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CategoryList extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    categoryPrefab: cc.Prefab = null;

    onCategoryChanged = (index: number) => {
        //handle
    };

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;
    protected onLoad(): void {
        this.initGameUIEvents();
    }

    public initGameUIEvents() {
        uiManager.emitterListener(
            InternalEvents.CHANGE_CATEGORY,
            (category) => {
                const categoryList = this.content.getComponentsInChildren(Category);
                categoryList.forEach((categoryComp, index) => {
                    index === category && categoryComp.selectCategory(true);
                });
                this.onCategoryChanged(category);
            },
            this
        );
    }

    public loadCategory() {
        const categoryList = LobbyManager.getInstance().getCategoryList();
        const categoryLength = categoryList.length - 1;
        this.categoryPrefab &&
            categoryList.forEach(({ name, index }) => {
                const categoryNode = cc.instantiate(this.categoryPrefab);
                categoryNode.name = index.toString();
                const itemCategory = categoryNode?.getComponent(Category);
                itemCategory.CategoryName = name;
                itemCategory.Index = index;
                itemCategory.enabledCategorySeparator(categoryLength);
                itemCategory.onCategoryChanged = (category) => {
                    uiManager.isPauseLoadingIcons = false;
                    this.onCategoryChanged(category);
                };
                this.content?.addChild(categoryNode);
            });
    }

    public activeBgNewOnCategory() {
        const categoryList = LobbyManager.getInstance().getCategoryList();
        categoryList.forEach(({ index, gameIds }) => {
            const isNew = gameIds.some(
                (gameId) => this.lobbyMenuConfig.isNewGame(gameId, index) && userManager.offerGames.includes(gameId)
            );
            const categoryNode = this.content.children.find((child) => child.name === index.toString());
            if (categoryNode && index !== 0) {
                const newNode = categoryNode?.getComponent(CategoryItem);
                newNode.newNode.active = isNew;
            }
        });
    }

    public activeCategoryFromStorage(): number {
        const storage = StorageManager.get("current_game_category");
        let category = 0;
        if (storage) {
            category = parseInt(storage) || 0;
        }

        const node = this.content.children.find((child) => child.name === `${category}`);
        if (node) {
            node?.getComponent(cc.Toggle)?.check();
        }

        return category;
    }
}

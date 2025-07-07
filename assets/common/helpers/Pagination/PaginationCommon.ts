import AudioManager from "../../audio/AudioManager";
import PaginationCommonItem from "./PaginationCommonItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PaginationCommon extends cc.Component {
    @property(cc.Node)
    nodeFirst: cc.Node = null;

    @property(cc.Node)
    nodePrevious: cc.Node = null;

    @property(cc.Node)
    nodePage1: cc.Node = null;

    @property(cc.Node)
    nodePage2: cc.Node = null;

    @property(cc.Node)
    nodePage3: cc.Node = null;

    @property(cc.Node)
    nodePage4: cc.Node = null;

    @property(cc.Node)
    nodePage5: cc.Node = null;

    @property(cc.Node)
    nodeNext: cc.Node = null;

    @property(cc.Node)
    nodeLast: cc.Node = null;

    @property({ type: cc.Integer })
    page = 1;

    @property({ type: cc.Integer })
    columnsOnPage = 10;

    @property({ type: cc.Integer })
    total = 0;

    protected pageSelect: any = null;
    protected control: any = null;
    protected lengthNodePage: any = null;
    protected distanceNumberCenter = 0;
    protected distanceYetChaos = 0;
    protected totalPage = 0;
    protected pageRed = 0;
    protected listComponentPage: PaginationCommonItem[] = [];
    protected listNodePage: cc.Node[] = [];
    protected pageNumberCurrent = 1;

    init(main: any) {
        const listPageName = [];
        this.listNodePage = [this.nodePage1, this.nodePage2, this.nodePage3, this.nodePage4, this.nodePage5];

        this.listNodePage.forEach((node) => {
            this.listComponentPage.push(node.getComponent(PaginationCommonItem));
        });
        this.control = main;

        this.listComponentPage.forEach((page) => {
            listPageName.push(page.node.name);
        });
        this.lengthNodePage = listPageName.length;
        this.distanceNumberCenter = Math.floor(this.lengthNodePage / 2);
        this.distanceYetChaos = Math.round(this.lengthNodePage / 2);
    }

    onSet(page: number, columnsOnPage: number, totalRow: number) {
        this.page = page;
        this.columnsOnPage = columnsOnPage;
        this.total = totalRow;
        this.totalPage = Math.ceil(totalRow / this.columnsOnPage);
        this.pageRed = this.totalPage - this.page;

        if (totalRow > 0) {
            this.listNodePage.forEach((node) => {
                node.active = false;
            });

            this.node.active = true;
            this.handleActionPage();
        } else {
            this.node.active = false;
        }

        this.updateArrowButtonsVisibility();
        this.updateLayout();
    }

    resetPageCurrent() {
        this.pageNumberCurrent = 1;
    }

    updateLayout() {
        const layout = this.node.getComponent(cc.Layout);
        layout.enabled = true;
        layout.updateLayout();
        layout.enabled = false;
    }

    handleActionPage() {
        let startIndex = 1;
        let isButtonActive = false;
        if (this.page === 1 || this.totalPage <= this.lengthNodePage) {
            startIndex = 1;
        } else if (this.page > 3) {
            startIndex = this.getStartPage();
        }

        this.listComponentPage.forEach((component, index) => {
            if (index <= this.totalPage && startIndex <= this.totalPage) {
                isButtonActive = false;
                component.page = startIndex;
                component.number.string = startIndex.toString();
                startIndex++;
                component.node.active = true;

                if (+component.number.string === this.pageNumberCurrent) {
                    isButtonActive = true;
                    this.pageSelect = component;
                    component.node.pauseSystemEvents(true);
                }

                component.updateHighlight(isButtonActive);
            } else {
                component.node.active = false;
            }
        });

        return void 0;
    }

    getStartPage() {
        const numberSub = this.page === this.totalPage ? this.lengthNodePage - 1 : this.distanceYetChaos;
        const isCheckPage = this.page + this.distanceNumberCenter <= this.totalPage;

        return isCheckPage ? this.page - this.distanceNumberCenter : this.page - numberSub;
    }

    updateArrowButtonsVisibility() {
        this.nodeFirst.active = this.page > 2;
        this.nodeLast.active = this.pageRed > 1;

        this.nodePrevious.active = this.page > 1;
        this.nodeNext.active = this.pageRed > 0;
    }

    onClickFirst() {
        this.control.get_data();
        this.pageNumberCurrent = 1;

        AudioManager.getInstance().playClick();
    }

    onClickLast() {
        this.control.get_data(Math.ceil(this.totalPage));
        this.pageNumberCurrent = this.totalPage;

        AudioManager.getInstance().playClick();
    }

    onClickPrevious() {
        this.page = this.pageSelect.number.string - 1;
        this.page > 0 && this.control.get_data(this.page);
        this.pageNumberCurrent = this.page;

        AudioManager.getInstance().playClick();
    }

    onClickNext() {
        const pageNext = +this.pageSelect.number.string + 1;
        pageNext <= this.totalPage && this.control.get_data(pageNext);
        this.pageNumberCurrent = pageNext;

        AudioManager.getInstance().playClick();
    }

    onClickPage(event: any) {
        const comp = event.target.getComponent(PaginationCommonItem);
        this.pageNumberCurrent = comp.page;
        this.control.get_data(comp.page);

        AudioManager.getInstance().playClick();
    }
}

import RouletteGroupBetItem from "./RouletteGroupBetItem";
import RouletteNumber from "./RouletteNumber";
import RouletteUtils from "./RouletteUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteQuickBet extends cc.Component {
    @property(cc.Node)
    numberContainer: cc.Node = null;

    @property(cc.Node)
    groupItemNode: cc.Node = null;

    rouletteNumbers: RouletteNumber[] = [];
    groupItems: RouletteGroupBetItem[] = [];

    public callback = {
        getCurrentBet: () => 1,
        highlight: (highlight: boolean, numbers: number[]) => {},
        selected: (betChoices: any) => {}
    };

    onLoad() {
        this.initGroupBetItems();
        this.initHandleTouch();
        this.rouletteNumbers = this.numberContainer.children
            .map((child) => child.getComponent(RouletteNumber))
            .sort((a, b) => +a.node.name - +b.node.name);
    }

    onDestroy() {
        this.clearEventListeners();
    }

    getNeighbours(number: number) {
        const array = [
            0,
            32,
            15,
            19,
            4,
            21,
            2,
            25,
            17,
            34,
            6,
            27,
            13,
            36,
            11,
            30,
            8,
            23,
            10,
            5,
            24,
            16,
            33,
            1,
            20,
            14,
            31,
            9,
            22,
            18,
            29,
            7,
            28,
            12,
            35,
            3,
            26
        ];
        const centerIndex = array.findIndex((n) => n === number);
        const padding = 2;
        const neighbors = [];
        for (let i = centerIndex - padding; i <= centerIndex + padding; i++) {
            const index = (i + array.length) % array.length;
            neighbors.push(array[index]);
        }
        return neighbors;
    }

    initHandleTouch() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onTouchCancel, this);
    }

    clearEventListeners() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.node.off(cc.Node.EventType.MOUSE_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.onTouchCancel, this);
    }

    checkCollider(location, collider) {
        return cc.Intersection.pointInPolygon(location, collider.world.points);
    }

    onTouchMove(e) {
        const location = e.getLocation();
        this.groupItems.forEach((groupItem) => {
            if (!groupItem.parentControl) {
                return;
            }

            if (this.checkCollider(location, groupItem.collider)) {
                this.internalHighlight(true, groupItem.getNumbers());
            }
        });

        this.rouletteNumbers.forEach((rouletteNumber) => {
            const collider = rouletteNumber.highlight.getComponent(cc.PolygonCollider);
            if (collider) {
                if (this.checkCollider(location, collider)) {
                    const numbers = this.getNeighbours(+rouletteNumber.node.name);
                    this.internalHighlight(true, numbers);
                }
            }
        });
    }

    onTouchEnd(e) {
        const location = e.getLocation();
        this.groupItems.forEach((groupItem) => {
            if (!groupItem.parentControl) {
                return;
            }

            if (this.checkCollider(location, groupItem.collider)) {
                const numbers = groupItem.getNumbers();
                this.internalHighlight(false, numbers);

                const betChoices = RouletteUtils.createQuickBetChoices(groupItem.betType, this.callback.getCurrentBet());
                this.internalSelected(betChoices);
            }
        });

        this.rouletteNumbers.forEach((rouletteNumber) => {
            const collider = rouletteNumber.highlight.getComponent(cc.PolygonCollider);
            if (collider) {
                if (this.checkCollider(location, collider)) {
                    const numbers = this.getNeighbours(+rouletteNumber.node.name);
                    const betChoices = {
                        straightUp: {}
                    };
                    numbers.forEach((number) => {
                        betChoices["straightUp"][number] = this.callback.getCurrentBet();
                    });
                    this.internalHighlight(false, numbers);
                    this.internalSelected(betChoices);
                }
            }
        });
    }

    onTouchCancel(e) {
        this.rouletteNumbers.forEach((number) => {
            number.clearHighlight();
        });
        this.internalHighlight(false, []);
    }

    internalHighlight(highlight, numbers) {
        if (highlight) {
            this.highlightNumbers(numbers);
        } else {
            this.clearHighlight();
        }

        this.callback.highlight(highlight, numbers);
    }

    internalSelected(betChoices: any) {
        this.callback.selected(betChoices);
    }

    initGroupBetItems() {
        this.groupItems = this.groupItemNode.children.map((child) => child.getComponent(RouletteGroupBetItem));
        this.groupItems.forEach((item) => {
            item.groupBetItemCallback.highlight = (highlight, numbers) => {
                this.internalHighlight(highlight, numbers);
            };
            item.groupBetItemCallback.selected = (betType, numbers) => {
                this.internalHighlight(false, numbers);
                const betChoices = RouletteUtils.createQuickBetChoices(betType, this.callback.getCurrentBet());
                this.internalSelected(betChoices);
            };
        });
    }

    highlightNumbers(numbers: number[]) {
        this.rouletteNumbers.forEach((number, index) => {
            if (numbers.includes(index)) {
                number.showHighlight();
            } else {
                number.clearHighlight();
            }
        });
    }

    clearHighlight() {
        this.rouletteNumbers.forEach((number) => {
            number.clearHighlight();
        });
    }
}

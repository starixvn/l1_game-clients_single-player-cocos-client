import * as _ from "lodash";

import BetChips from "../../../common/bet-chips/view-models/BetChips";
import { userManager } from "../../../common/user/UserManager";
import BetDetailTip from "./BetDetailTip";
import { RouletteBetInfo } from "./Roulette";
import { RouletteBetType } from "./RouletteCommon";
import RouletteGroupBetItem from "./RouletteGroupBetItem";
import RouletteNumber from "./RouletteNumber";
import RouletteUtils from "./RouletteUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteBoard extends cc.Component {
    @property(cc.Node)
    groupItemNode: cc.Node = null;

    @property(cc.Node)
    touchArea: cc.Node = null;

    @property(cc.Node)
    gridStartNode: cc.Node = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    otherChipContainer: cc.Node = null;

    @property(cc.Node)
    numberContainer: cc.Node = null;

    @property(cc.Prefab)
    tipPrefab: cc.Prefab = null;

    @property(cc.Node)
    imageDecimalOdds: cc.Node = null;

    @property(cc.Node)
    imageFractionalOdds: cc.Node = null;

    middleCellOffset = 12;

    private cellSize: cc.Size;
    groupItems: RouletteGroupBetItem[] = [];
    rouletteNumbers: RouletteNumber[] = [];
    detailTips: BetDetailTip[] = [];

    private betChoices = {};
    private otherBetChoices = {};

    betChips: BetChips;

    public callback = {
        selected: (betInfo: RouletteBetInfo) => {}
    };

    onLoad() {
        this.cellSize = new cc.Size(this.gridStartNode.width, this.gridStartNode.height);
        this.middleCellOffset = this.gridStartNode.getComponent(cc.Widget).bottom;
        this.initGroupBetItems();
        this.rouletteNumbers = this.numberContainer.children.map((child) => child.getComponent(RouletteNumber));

        this.touchArea.on(cc.Node.EventType.TOUCH_START, this.onTouchMove, this);
        this.touchArea.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchArea.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touchArea.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.touchArea.on(cc.Node.EventType.MOUSE_ENTER, this.onTouchMove, this);
        this.touchArea.on(cc.Node.EventType.MOUSE_MOVE, this.onTouchMove, this);
        this.touchArea.on(cc.Node.EventType.MOUSE_LEAVE, this.onTouchCancel, this);

        this.initImageBackground();
    }

    onDestroy() {
        this.touchArea.off(cc.Node.EventType.TOUCH_START, this.onTouchMove, this);
        this.touchArea.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchArea.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touchArea.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.touchArea.off(cc.Node.EventType.MOUSE_ENTER, this.onTouchMove, this);
        this.touchArea.off(cc.Node.EventType.MOUSE_MOVE, this.onTouchMove, this);
        this.touchArea.off(cc.Node.EventType.MOUSE_LEAVE, this.onTouchCancel, this);
    }

    initImageBackground() {
        const isFractionalOddsFormat = userManager.fractionalOddsFormat;
        this.imageDecimalOdds.active = !isFractionalOddsFormat;
        this.imageFractionalOdds.active = isFractionalOddsFormat;
    }

    onTouchMove(e) {
        const localLocation = this.touchArea.convertToNodeSpaceAR(e.getLocation());
        const location = localLocation.sub(this.gridStartNode.position);
        if (location.x < 0 && location.y < 0) {
            this.clearHighlight();
            return;
        }

        const betInfo = this.getBetInfo(location);
        this.internalHighlight(true, betInfo.numbers);
    }

    onTouchEnd(e) {
        const localLocation = this.touchArea.convertToNodeSpaceAR(e.getLocation());
        const location = localLocation.sub(this.gridStartNode.position);
        this.clearHighlight();
        if (location.x < 0 && location.y < 0) {
            return;
        }

        const betInfo = this.getBetInfo(location);
        this.callback.selected(betInfo);
    }

    onTouchCancel(e) {
        this.clearHighlight();
    }

    getBetDetail(index: number) {
        if (index >= this.detailTips.length) {
            const tip = cc.instantiate(this.tipPrefab);
            this.node.addChild(tip);
            const component = tip.getComponent(BetDetailTip);
            this.detailTips.push(component);
            return component;
        }

        return this.detailTips[index];
    }

    showBetDetailTips() {
        this.hideBetDetailTips();
        let i = 0;
        for (const type in this.betChoices) {
            for (const key in this.betChoices[type]) {
                const bet = this.betChoices[type][key];
                const node = this.getBetNodeByKey(type, key);

                const tip = this.getBetDetail(i);
                tip.show(bet);
                tip.node.position = cc.v3(this.node.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(0, 0))));
                i++;
            }
        }
    }

    hideBetDetailTips() {
        this.detailTips.forEach((tip) => tip.hide());
    }

    internalHighlight(highlight, numbers) {
        if (highlight) {
            this.highlightNumbers(numbers);
            this.showBetDetailTips();
        } else {
            this.clearHighlight();
        }
    }

    highlightLastResult(result: number, animated: boolean) {
        this.rouletteNumbers.forEach((n) => {
            if (result === +n.node.name) {
                n.showWinning(animated);
            } else {
                n.clearHighlight();
            }
        });

        this.groupItems.forEach((item) => {
            const index = item.getNumbers().findIndex((n) => n === result);
            if (index > -1) {
                item.showWinning(animated);
            } else {
                item.clearHighlight();
            }
        });
    }

    initGroupBetItems() {
        this.groupItems = this.groupItemNode.children.map((child) => child.getComponent(RouletteGroupBetItem));
        this.groupItems.forEach((item) => {
            item.groupBetItemCallback.highlight = (highlight, numbers) => {
                this.internalHighlight(highlight, numbers);
            };
            item.groupBetItemCallback.selected = (betType, numbers) => {
                const betInfo: RouletteBetInfo = {
                    type: betType,
                    numbers
                };
                this.callback.selected(betInfo);
            };
        });
    }

    getNumber(col: number, row: number): number {
        if (row < 0) {
            return -1;
        }
        col = Math.min(col, 11);
        row = Math.min(row, 2);

        return col < 0 ? 0 : col * 3 + row + 1;
    }

    getBetInfo(location: cc.Vec2): RouletteBetInfo {
        const col = Math.floor(location.x / this.cellSize.width);
        const row = Math.floor(location.y / this.cellSize.height);

        const offsetX = location.x - col * this.cellSize.width;
        const offsetY = location.y - row * this.cellSize.height;

        const colArr = [col];
        let rowArr = [row];
        if (offsetX < this.middleCellOffset) {
            colArr.push(col - 1);
        } else if (offsetX > this.cellSize.width - this.middleCellOffset) {
            colArr.push(col + 1);
        }

        let isSpecial = false;
        if (offsetY < this.middleCellOffset) {
            rowArr.push(row - 1);
            if (row === 0) {
                isSpecial = true;
            }
        } else if (offsetY > this.cellSize.height - this.middleCellOffset) {
            rowArr.push(row + 1);
            if (row < 0) {
                isSpecial = true;
            }
        }

        if (isSpecial) {
            rowArr = [0, 1, 2];
        }

        let selectNumbers = this.getSelectNumbersOnBetInfo(colArr, rowArr);
        selectNumbers = _.uniq([...selectNumbers].sort((a, b) => a - b));
        const count = selectNumbers.length;
        let type: RouletteBetType;

        switch (count) {
            case 6:
                type = RouletteBetType.Line;
                break;
            case 4:
                type = isSpecial ? RouletteBetType.FourNumbers : RouletteBetType.Corner;
                break;
            case 3:
                type = isSpecial ? RouletteBetType.Street : RouletteBetType.Triangle;
                break;
            case 2:
                type = RouletteBetType.Split;
                break;
            default:
                type = RouletteBetType.StraightUp;
                break;
        }

        return {
            type: type,
            numbers: selectNumbers
        };
    }

    getSelectNumbersOnBetInfo(colArr: number[], rowArr: number[]) {
        const selectNumbers = [];
        colArr.forEach((colElement) => {
            rowArr.forEach((rowElement) => {
                const element = this.getNumber(colElement, rowElement);
                if (element !== -1) {
                    selectNumbers.push(element);
                }
            });
        });

        return selectNumbers;
    }

    getLocation(betNumber: number): cc.Vec2 {
        const col = Math.floor((betNumber - 1) / 3);
        const row = (betNumber - 1) % 3;

        return cc.v2(col * this.cellSize.width, row * this.cellSize.height);
    }

    addBetChoice(betInfo: RouletteBetInfo, bet: number, other = false) {
        const key = RouletteUtils.getKey(betInfo);
        this.addBetChoiceByKey(betInfo.type, key, bet, other);

        this.showBetDetailTips();
    }

    addBetChoiceByKey(type: string, key: string, bet: number, other = false) {
        const betChoicesContent = other ? this.otherBetChoices : this.betChoices;
        if (!betChoicesContent[type]) {
            betChoicesContent[type] = {};
        }
        const current = betChoicesContent[type][key] || 0;
        betChoicesContent[type][key] = current + bet;
        this.placeChipsByKey(type, key, betChoicesContent[type][key], !other, other);
    }

    clearOtherBetChoices() {
        this.otherBetChoices = {};
        this.otherChipContainer.removeAllChildren();
    }

    showBetChoices(betChoices: any, currentBetChoices: any, other = false) {
        if (other) {
            this.otherChipContainer.removeAllChildren();
            this.otherBetChoices = _.cloneDeep(betChoices);
        } else {
            this.chipContainer.removeAllChildren();
            this.betChoices = _.cloneDeep(betChoices);
        }

        const betChoicesContent = other ? this.otherBetChoices : this.betChoices;
        for (const type in betChoicesContent) {
            for (const key in betChoicesContent[type]) {
                const bet = betChoicesContent[type][key];
                const highlight = !currentBetChoices[type] || !currentBetChoices[type][key] || currentBetChoices[type][key] !== bet;
                this.placeChipsByKey(type, key, bet, highlight, other);
            }
        }
    }

    getBetNodeByKey(type: string, key: string, other = false): cc.Node {
        const childName = `${type}_${key}`;

        const parent = other ? this.otherChipContainer : this.chipContainer;
        let childNode = parent.getChildByName(childName);
        if (!childNode) {
            childNode = new cc.Node();
            childNode.name = childName;
            parent.addChild(childNode);
            switch (type) {
                case RouletteBetType.Column:
                case RouletteBetType.Dozen:
                case RouletteBetType.RedBlack:
                case RouletteBetType.OddEven:
                case RouletteBetType.BigSmall:
                    const groupItem = this.groupItems.find((child) => child.betType === type && child.node.name === key);
                    childNode.position = cc.v3(parent.convertToNodeSpaceAR(groupItem.node.convertToWorldSpaceAR(cc.v2(0, 0))));
                    break;
                default:
                    childNode.position = cc.v3(this.getOnBoardChipLocation(type, key));
                    break;
            }

            childNode.scale = 1.35;
        }

        childNode.zIndex = 10 - (childNode.position.y * 2) / this.cellSize.height;

        return childNode;
    }

    placeChipsByKey(type: string, key: string, bet: number, highlight = false, other = false) {
        const childNode = this.getBetNodeByKey(type, key, other);
        childNode.destroyAllChildren();
        const node = RouletteUtils.createChips(bet, this.betChips, highlight);
        childNode.addChild(node);
    }

    placeChips(betInfo: RouletteBetInfo, bet: number, highlight = false, other = false) {
        const childNode = this.getBetNodeByKey(betInfo.type, RouletteUtils.getKey(betInfo), other);
        childNode.destroyAllChildren();
        const node = RouletteUtils.createChips(bet, this.betChips, highlight);
        childNode.addChild(node);
    }

    getOnBoardChipLocation(type, key) {
        const numbers = RouletteUtils.parseKeyToNumbers(key);
        let location = this.getLocation(numbers[0]);
        const offset = cc.v2(this.cellSize.width / 2, this.cellSize.height / 2);
        switch (type) {
            case RouletteBetType.Line:
                location = this.getLocation(numbers[3]);
                break;
            case RouletteBetType.FourNumbers:
                location = this.getLocation(numbers[1]);
                break;
            case RouletteBetType.Corner:
                location = this.getLocation(numbers[3]);
                break;
            case RouletteBetType.Street:
                location = location.add(cc.v2(offset.x, 0));
                break;
            case RouletteBetType.Triangle:
                location = this.getLocation(numbers[2]);
                break;
            case RouletteBetType.Split:
                if (numbers[0] === 0) {
                    location = this.getLocation(numbers[1]).add(cc.v2(0, offset.y));
                } else {
                    const location2 = this.getLocation(numbers[1]).add(offset);
                    location = location.add(offset);
                    location = location.add(location2).mul(0.5);
                }
                break;
            case RouletteBetType.StraightUp:
                location = location.add(offset);
                if (numbers[0] === 0) {
                    location = location.add(cc.v2(0, this.cellSize.height * 2));
                }
                break;
            default:
                break;
        }

        return location;
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

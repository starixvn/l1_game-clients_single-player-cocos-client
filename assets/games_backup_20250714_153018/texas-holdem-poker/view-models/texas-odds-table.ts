import oddOption from "./texas-odds";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TexasOddsTable extends cc.Component {
    @property({ type: [oddOption] })
    oddOptions: oddOption[] = [];
}

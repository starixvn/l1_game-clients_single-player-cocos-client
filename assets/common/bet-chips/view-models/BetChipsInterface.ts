export default interface BetChipsInterface {
    chipValues: number[];

    createChipFly(value: number): cc.Node;

    createLowValueChip();

    createBigChip(value: number): cc.Node;
}

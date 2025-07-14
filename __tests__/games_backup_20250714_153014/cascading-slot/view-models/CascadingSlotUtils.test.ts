import { convertBoardValue } from "../../../../assets/games/cascading-slot/view-models/CascadingSlotUtils";

describe("Cascading Slot Utils", () => {
    let input: number[];
    let output: number[][];
    describe("Func convertBoardValue", () => {
        beforeEach(() => {
            // Arrange
            input = [8, 8, 8, 3, 8, 9, 8, 8, 8, 9, 5, 9, 8, 10, 10, 9, 5, 8, 10, 11, 10, 6, 11, 8, 10, 11, 11, 6, 11, 7];

            // Act
            output = convertBoardValue(input);
        });
        it("Board has 6 columns", () => {
            // Assert
            expect(output.length).toEqual(6);
        });

        it("Board has 5 rows", () => {
            // Assert
            expect(output[0].length).toEqual(5);
        });

        it("Block of 5 number is data for each column", () => {
            const expectValue = [
                [8, 3, 8, 8, 8],
                [9, 8, 8, 8, 9],
                [10, 10, 8, 9, 5],
                [11, 10, 8, 5, 9],
                [10, 8, 11, 6, 10],
                [7, 11, 6, 11, 11]
            ];

            // Assert
            expect(output).toStrictEqual(expectValue);
        });

        it("Data in each column is reverse", () => {
            const expectValue = input.slice(0, 5).reverse();

            // Assert
            expect(output[0]).toStrictEqual(expectValue);
        });
    });
});

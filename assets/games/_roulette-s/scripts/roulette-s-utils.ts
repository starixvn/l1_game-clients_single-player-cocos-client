export const getTypeFromChoice = (choice: string) => {
    const dict = {
        split: [],
        street: [],
        triangle: [],
        corner: [],
        fourNumbers: [],
        line: [],
        column: ["column1", "column2", "column3"],
        dozen: ["dozen1", "dozen2", "dozen3"],
        redBlack: ["red", "black"],
        oddEven: ["odd", "even"],
        bigSmall: ["big", "small"]
    };

    const type = Object.keys(dict).find((type) => dict[type].includes(choice));

    if (type) {
        return type;
    }

    const numbers = choice.split(",");
    const length = numbers.length;

    if (length === 1) {
        return "straightUp";
    }
    if (length === 2) {
        return "split";
    }
    if (length === 3) {
        if (choice === "0,1,2" || choice === "0,2,3") {
            return "street";
        }
        return "triangle";
    }
    if (length === 4) {
        if (choice === "0,1,2,3") {
            return "fourNumbers";
        }
        return "corner";
    }

    return "line";
};

export const CustomColor = {
    green: "#139A3D",
    red: "#AE0303",
    black: "#0A0A0A"
};

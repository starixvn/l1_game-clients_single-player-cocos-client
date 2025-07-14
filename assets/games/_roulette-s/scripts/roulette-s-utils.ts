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

export const convertOwnBetsToTempBet = (ownBets: any): { choice: string; amount: number } => {
    let flattenedBets: { choice: string; amount: number } = { choice: "", amount: 0 };

    Object.keys(ownBets).forEach((type) => {
        const typeData = ownBets[type];

        if (typeof typeData === "object" && typeData !== null) {
            // Handle nested structure like {"dozen": {"3": 100}}
            Object.keys(typeData).forEach((subChoice) => {
                const amount = typeData[subChoice];
                const choice = `${type}${subChoice}`;
                flattenedBets = { choice, amount };
            });
        } else if (typeof typeData === "number") {
            // Handle direct structure like {"red": 100}
            flattenedBets = { choice: type, amount: typeData };
        }
    });

    return flattenedBets;
};

export const convertOwnChipToFlattened = (ownChip: any): { betChoice: string; endBet: number } => {
    let flattenedBets: { betChoice: string; endBet: number } = { betChoice: "", endBet: 0 };

    // Handle new structure with betChoices and amount
    Object.keys(ownChip.betChoices).forEach((type) => {
        const typeData = ownChip.betChoices[type];

        if (typeof typeData === "object" && typeData !== null) {
            // Handle nested structure like {"dozen": {"3": 100}} or {"redBlack": {"black": 100}}
            Object.keys(typeData).forEach((subChoice) => {
                let choice: string;

                // Special handling for redBlack, oddEven, bigSmall types
                if (type === "redBlack" || type === "oddEven") {
                    choice = subChoice; // Use just the subChoice (e.g., "black", "odd", "big")
                } else if (type === "straightUp") {
                    choice = subChoice;
                } else {
                    choice = `${type}${subChoice}`; // Use combined type+subChoice (e.g., "dozen3", "column1")
                }

                flattenedBets = { betChoice: choice, endBet: ownChip.amount };
            });
        } else if (typeof typeData === "number") {
            // Handle direct structure like {"red": 100}
            flattenedBets = { betChoice: type, endBet: ownChip.amount };
        }
    });

    return flattenedBets;
};

export const convertOwnChipToTempBet = (ownChip: any): { choice: string; amount: number } => {
    let flattenedBets: { choice: string; amount: number } = { choice: "", amount: 0 };

    // Handle new structure with betChoices and amount
    Object.keys(ownChip.betChoices).forEach((type) => {
        const typeData = ownChip.betChoices[type];

        if (typeof typeData === "object" && typeData !== null) {
            // Handle nested structure like {"dozen": {"3": 100}} or {"redBlack": {"black": 100}}
            Object.keys(typeData).forEach((subChoice) => {
                let choice: string;

                // Special handling for redBlack, oddEven, bigSmall types
                if (type === "redBlack" || type === "oddEven") {
                    choice = subChoice; // Use just the subChoice (e.g., "black", "odd", "big")
                } else if (type === "straightUp") {
                    choice = subChoice;
                } else {
                    choice = `${type}${subChoice}`; // Use combined type+subChoice (e.g., "dozen3", "column1")
                }

                flattenedBets = { choice, amount: ownChip.amount };
            });
        } else if (typeof typeData === "number") {
            // Handle direct structure like {"red": 100}
            flattenedBets = { choice: type, amount: ownChip.amount };
        }
    });

    return flattenedBets;
};

export const CustomColor = {
    green: "#139A3D",
    red: "#AE0303",
    black: "#0A0A0A"
};

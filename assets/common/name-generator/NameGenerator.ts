import * as Chance from "chance";

import * as new_202010 from "./name-dictionaries/202010_new";
import * as animals from "./name-dictionaries/animals";
import * as colors from "./name-dictionaries/colors";
import * as cools from "./name-dictionaries/cools";
import * as fruits from "./name-dictionaries/fruits";
import * as marvels from "./name-dictionaries/marvels";
import { uniqueNamesGenerator } from "./unique-names-generator/unique-names-generator";

export default class NameGenerator {
    static chance = new Chance();

    public static generateName(): string {
        const dictionaries = [colors, animals, marvels, fruits, cools, new_202010];

        const randomDictionaryIndex = NameGenerator.chance.integer({ min: 0, max: dictionaries.length - 1 });
        const pickedDictionary = dictionaries[randomDictionaryIndex];

        const shortName = uniqueNamesGenerator({
            dictionaries: [pickedDictionary],
            separator: "",
            length: 1
        });

        const numberLength = shortName.length < 10 ? 5 : 14 - shortName.length;
        let maxNumber = "";
        for (let i = 0; i < numberLength; i++) {
            maxNumber = `9${maxNumber}`;
        }
        const randomNumber = NameGenerator.chance.integer({ min: 0, max: +maxNumber });

        return `${shortName}${randomNumber}`;
    }
}

import { FormationHandler } from "../i18n/FormationHandler";

export default class StringUtil {
    public static formatText(value: string, format: FormationHandler) {
        const conditions = [
            {
                condition: format === FormationHandler.LOWER,
                handle: this.lowerCase
            },
            {
                condition: format === FormationHandler.UPPER,
                handle: this.upperCase
            },
            {
                condition: format === FormationHandler.TITLE,
                handle: this.titleCase
            }
        ];
        const condition = conditions.find((passed) => passed.condition);
        return condition?.handle(value) ?? value;
    }

    private static titleCase(value: string): string {
        return value
            .split("\n")
            .map((line) =>
                line
                    .split(" ")
                    .map((word) =>
                        /^\d/.test(word) // Check if the word starts with a number
                            ? word
                            : word
                                  .split("-")
                                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                                  .join("-")
                    )
                    .join(" ")
            )
            .join("\n");
    }

    private static upperCase(value: string) {
        return value.toUpperCase();
    }

    private static lowerCase(value: string) {
        return value.toLowerCase();
    }
}

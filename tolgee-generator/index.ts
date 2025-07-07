import { DevTools, Tolgee } from "@tolgee/web";
import * as fs from "fs";

const gameId = 80;
interface Config {
    namespaces: string[];
    gameNameFolder: string;
}

function writeFile(fileName: string, content: string, extension = "ts") {
    fs.writeFileSync(`${fileName}.${extension}`, content, {
        encoding: "utf8",
        flag: "w"
    });
}

const getConfig = (): Config => {
    const content = fs.readFileSync("./tolgee-generator/games-translation.json", {
        encoding: "utf8",
        flag: "r"
    });
    const gamesTranslation = JSON.parse(content);
    const config = gamesTranslation.Configs.find((element) => element.id == gameId);
    return { gameNameFolder: config.gameNameFolder, namespaces: config.namespaces };
};

const configFromFile = getConfig();

const gameNameFolder = configFromFile.gameNameFolder;
const namespaces = [...configFromFile.namespaces];
const pathToGame = `./assets/games/${gameNameFolder}`;
const languageFolder = `${pathToGame}/i18n/texts/${gameNameFolder}-`;
const languageCodes = ["en", "id", "th", "vi", "zh_cn", "zh_tw"];
const tg = Tolgee().use(DevTools()).init({
    defaultLanguage: "en",
    availableLanguages: languageCodes,
    apiKey: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
    apiUrl: "https://tolgee.sabagame.com/",
    projectId: "5",
    defaultNs: "messages",
    ns: namespaces
});

tg.run();

tg.on("initialLoad", async () => {
    const languages: {
        [languageId: string]: {
            [ns: string]: {
                [key: string]: string;
            };
        };
    } = {};

    const remoteNames: {
        [propertyName: string]: {
            [gameId: string]: string;
        };
    } = {
        lobbyNames: {},
        gameNames: {}
    };

    for (let index = 0; index < languageCodes.length; index++) {
        const languageId = languageCodes[index];

        await tg.changeLanguage(languageId);
        languages[languageId] = {};
        namespaces.forEach((ns) => {
            tg.getAllRecords().forEach((record) => {
                if (record.namespace == ns) {
                    languages[languageId][ns] = {};
                    record.data.forEach((value, key) => {
                        languages[languageId][ns][key] = value as string;

                        if (key == "game_name") {
                            remoteNames.gameNames[gameId] = value as string;
                        }
                        if (key == "game_icon_name") {
                            remoteNames.lobbyNames[gameId] = value as string;
                        }
                    });
                }
            });
        });

        languages[languageId] = { ...languages[languageId], ...remoteNames };

        const languageScript = `import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {0};

reloadLanguageData("${languageId}", phrases);`;

        writeFile(languageFolder + languageId, languageScript.replace("{0}", JSON.stringify(languages[languageId], null, 4)));
    }

    console.log("Generated done!");
});

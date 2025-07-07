import { convertOldRank } from "../../common/new-card/view-models/NewCard";

type MD5Result = {
    cards: CardModel[];
    suffix: string;
    firstCharacter: string;
    endCharacter: string;
    suitBlack: string;
    suitRed: string;
    isShowIconSuit?: boolean;
    length?: number;
    roundId?: string;
};
type CardModel = { rank: number; suit: number };

export const suffixIcon = ["♥", "♦", "♣", "♠"];

const formatString = ({ cards, firstCharacter, endCharacter, suitBlack, suitRed, isShowIconSuit: isShowIconSuit }) => {
    let result = "";
    cards.forEach((card: CardModel, index: number) => {
        const start = index === 0 ? `<color=#ffffff>${firstCharacter}</color>` : "";
        const end = index === cards.length - 1 ? `<color=#ffffff>${endCharacter}</color>` : "";
        const comma = index === cards.length - 1 ? "" : index === 1 || index === 3 ? `<color=#ffffff>, </color>` : " ";
        const cardValue = isShowIconSuit ? formatCardSuit({ card, suitBlack, suitRed }) : formatCard({ card, suitBlack, suitRed });
        result += `${start}${cardValue}${comma}${end}`;
    });

    return result;
};

const formatCard = ({ card, suitBlack, suitRed }) => {
    return card.suit > 1
        ? `<color=${suitBlack}>${convertOldRank(+card.rank)}</color>`
        : `<color=${suitRed}>${convertOldRank(+card.rank)}</color>`;
};

const convertRankSuit = (card: CardModel) => {
    return convertOldRank(card.rank) + suffixIcon[card.suit];
};

const formatCardSuit = ({ card, suitBlack, suitRed }) => {
    return card.suit > 1 ? `<color=${suitBlack}>${convertRankSuit(card)}</color>` : `<color=${suitRed}>${convertRankSuit(card)}</color>`;
};

const getSuffix = ({ suffix, isShowIconSuit, roundId }) => {
    return isShowIconSuit ? `<color=#ffffff>{#${roundId}${suffix}}</color>` : `<color=#ffffff>${suffix}</color>`;
};

export const FormatMD5Result = ({
    cards,
    suffix,
    firstCharacter = "[",
    endCharacter = "]",
    suitBlack = "#ffffff",
    suitRed = "#ffffff",
    isShowIconSuit: isShowIconSuit,
    length,
    roundId = ""
}: MD5Result): string => {
    const resultFormatting = formatString({ cards, firstCharacter, endCharacter, suitBlack, suitRed, isShowIconSuit: isShowIconSuit });
    const suffixFormatting = getSuffix({ suffix, isShowIconSuit: isShowIconSuit, roundId });
    if (length > 0) {
        return `${resultFormatting}_${suffixFormatting}`.substring(0, length) + "...";
    }

    return `${resultFormatting}${suffixFormatting}`;
};

export const formatPrivateKey = (card, isShowIconSuit: true, suitBlack = "#98b2e5", suitRed = "#E92E2E"): string => {
    const cardValue = isShowIconSuit ? formatCardSuit({ card, suitBlack, suitRed }) : formatCard({ card, suitBlack, suitRed });
    return `${cardValue}`;
};

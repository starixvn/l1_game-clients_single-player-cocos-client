import { userManager } from "../user/UserManager";

const formatCommasReg = /\B(?=(\d{3})+(?!\d))/g;
const numberWithCommas = (number, toFixed = 1, noZeroSuffix = true) => {
    if (number) {
        let trimZeroNumber;
        if (noZeroSuffix) {
            trimZeroNumber = `${+(+number).toFixed(toFixed)}`;
        } else {
            trimZeroNumber = (+number).toFixed(toFixed);
        }
        return trimZeroNumber.replace(formatCommasReg, ",");
    }

    return "0";
};

const truncateFixedDecimals = (number, fixed) => {
    const withFixedDecimals = `${number}`.match(new RegExp(`^-?\\d+(?:\.\\d{0,${fixed}})?`))[0];
    return parseFloat(withFixedDecimals).toString().replace(formatCommasReg, ",");
};

const nFormatter = (num, digits = 0) => {
    const si = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "K" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    if (num < 1e3) {
        return `${num}`;
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
};

const getOnlyNumberInString = (t: string) => {
    const e = t.match(/\d+/g);

    return e ? e.join("") : "";
};

const numberPad = (number: number, length: number) => {
    let str = `${number}`;

    while (str.length < length) {
        str = `0${str}`;
    }

    return str;
};

const numberTo = (label, end, duration, currency = false) => {
    const endString = currency ? numberWithCommas(end, 1) : end;
    if (label.string === endString) {
        return;
    }
    const start = parseFloat(label.string.replace(/,/g, "")) || 0;
    const range = end - start;
    const stepCount = 20;
    const stepTime = duration / stepCount;
    const stepValue = range / stepCount;
    let step = 0;
    label.node.stopAllActions();
    cc.tween(label.node)
        .repeat(
            stepCount,
            cc
                .tween()
                .delay(stepTime)
                .call(() => {
                    const value = start + step * stepValue;
                    label.string = currency ? numberWithCommas(value, 1) : value;
                    step++;
                })
        )
        .call(() => {
            label.string = endString;
        })
        .start();
};

const zeroPad = (num: number, places: number) => {
    const zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
};

export function formatUserCurrency(balance, currency, isCash) {
    const userCurrency = currency ? currency.toUpperCase() : currency === undefined ? "" : currency;
    return `${this.numberWithCommas(balance)} ${isCash ? "" : userCurrency}`;
}

export const formatOdds = (value: number | string | undefined) => {
    return userManager.fractionalOddsFormat ? `${numberWithCommas(+value - 1, 2)}:1` : `1:${value}`;
};

export { numberWithCommas, getOnlyNumberInString, numberPad, numberTo, zeroPad, nFormatter, truncateFixedDecimals };

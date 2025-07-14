import * as moment from "moment";

const getStringDateByTime = (t) => {
    return moment(new Date(t)).format("HH:mm YYYY/MM/DD");
};

const formatDateTime = (t) => {
    return moment(new Date(t)).format("HH:mm:ss YYYY/MM/DD");
};

const getStringHourByTime = (t) => {
    return moment(new Date(t)).format("HH:mm:ss");
};

const getStringDate = (t) => {
    return moment(new Date(t)).format("YYYY/MM/DD");
};

export const getStringDate1 = (time: string) => {
    return moment(new Date(time)).format("MM/DD/YYYY");
};

export const getString12HourByTime = (time: string) => {
    return moment(new Date(time)).format("hh:mm:ss A");
};

export { formatDateTime, getStringDate, getStringDateByTime, getStringHourByTime };

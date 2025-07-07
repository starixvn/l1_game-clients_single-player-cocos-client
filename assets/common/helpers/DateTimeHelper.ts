import * as moment from "moment";

const getStringDateByTime = (t) => {
    return moment(new Date(t)).format("HH:mm DD/MM/YYYY");
};

const formatDateTime = (t) => {
    return moment(new Date(t)).format("HH:mm:ss DD/MM/YYYY");
};

const getStringHourByTime = (t) => {
    return moment(new Date(t)).format("HH:mm:ss");
};

const getStringDate = (t) => {
    return moment(new Date(t)).format("DD/MM/YYYY");
};

export const getStringDate1 = (time: string) => {
    return moment(new Date(time)).format("MM/DD/YYYY");
};

export const getString12HourByTime = (time: string) => {
    return moment(new Date(time)).format("hh:mm:ss A");
};

export { formatDateTime, getStringDate, getStringDateByTime, getStringHourByTime };

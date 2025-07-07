export const delayTime = (seconds: number) => {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, seconds * 1000);
    });
};

export const AXIOS_FAILED_PREFIX = "AXIOS_FAILED";

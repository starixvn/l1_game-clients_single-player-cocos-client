console.log("[Utils] Loading utils module...");

export const delayTime = (seconds: number) => {
    console.log("[Utils] Creating delay for", seconds, "seconds");
    return new Promise<void>((resolve) => {
        console.log("[Utils] Starting delay timer...");
        setTimeout(() => {
            console.log("[Utils] Delay completed after", seconds, "seconds");
            resolve();
        }, seconds * 1000);
    });
};

export const AXIOS_FAILED_PREFIX = "AXIOS_FAILED";

console.log("[Utils] Utils module loaded successfully");

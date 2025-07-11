console.log("[ErrorCodeHelper] Loading ErrorCodeHelper module...");

export const isSessionTimeoutError = (errorCode: string): boolean => {
    console.log("🔍 [ErrorCodeHelper] Checking if error code is session timeout:", errorCode);
    const expectedTokenErrorCodes = ["1001", "1002", "SB0002", "SB0011", "7001"];
    console.log("🔍 [ErrorCodeHelper] Expected token error codes:", expectedTokenErrorCodes);

    const isTimeout = expectedTokenErrorCodes.includes(errorCode);
    console.log("🔍 [ErrorCodeHelper] Is session timeout error:", isTimeout);

    return isTimeout;
};

console.log("[ErrorCodeHelper] ErrorCodeHelper module loaded successfully");

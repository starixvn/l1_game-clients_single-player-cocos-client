export const isSessionTimeoutError = (errorCode: string): boolean => {
    const expectedTokenErrorCodes = ["1001", "1002", "SB0002", "SB0011", "7001"];
    return expectedTokenErrorCodes.includes(errorCode);
};

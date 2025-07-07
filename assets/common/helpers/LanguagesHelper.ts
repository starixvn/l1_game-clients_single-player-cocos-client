const getCacheModeFollowLanguage = (currentLanguage = "en") => {
    let cacheMode = 1;
    switch (currentLanguage) {
        case "vi":
        case "en":
        case "id":
            cacheMode = 2;
            break;
        default:
            cacheMode = 0;
            break;
    }

    return cacheMode;
};

export { getCacheModeFollowLanguage };

const getLowercaseObjectKeys = (data: any) => {
    return Object.keys(data).reduce((keys, key) => {
        keys[key.toLowerCase()] = key;
        return keys;
    }, {});
};

export { getLowercaseObjectKeys };

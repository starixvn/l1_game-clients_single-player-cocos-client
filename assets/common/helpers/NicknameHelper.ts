const shortenName = (name: string) => {
    name = name.toLowerCase();
    const prefix = name.slice(0, 1);
    const suffix = name.slice(-3);
    return `${prefix}***${suffix}`;
};

export { shortenName };

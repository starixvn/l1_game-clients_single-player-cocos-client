const mockFuntions = {
    createNodeFromPrefab: () => {},
    mockGameUtils: () => ({
        default: class {
            public static createNodeFromPrefab() {
                return mockFuntions.createNodeFromPrefab();
            }
        }
    })
};

const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export { mockFuntions, delay };

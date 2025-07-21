// Mock Cocos Creator for Jest tests
global.cc = {
    _decorator: {
        ccclass: () => (target) => target,
        property: () => (target, propertyKey) => target
    },
    Label: class {
        constructor() {
            this.string = "";
        }
    },
    Sprite: class {
        constructor() {
            this.spriteFrame = null;
        }
    },
    Node: class {
        constructor() {
            this.active = false;
        }
    },
    Texture2D: class {
        constructor() {
            this.initWithElement = jest.fn();
        }
    },
    SpriteFrame: class {
        constructor() {
            this.setTexture = jest.fn();
        }
    },
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn()
};

// Mock Image constructor
global.Image = class {
    constructor() {
        this.crossOrigin = "";
        this.onload = null;
        this.onerror = null;
        this.src = "";
        this.complete = false;
        this.width = 100;
        this.height = 100;
    }
};

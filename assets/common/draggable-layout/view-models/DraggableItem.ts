const { ccclass, property } = cc._decorator;

@ccclass
export default class DraggableItem extends cc.Component {
    @property({ type: cc.PolygonCollider })
    colliders: cc.PolygonCollider[] = [];

    @property(cc.Node)
    targetNode: cc.Node = null;

    @property({ tooltip: "Enable logging for debugging" })
    enableLogging: boolean = true;

    @property({ tooltip: "Enable coordinate display" })
    enableCoordinateDisplay: boolean = true;

    @property({ tooltip: "Enable parent window communication" })
    enableParentCommunication: boolean = true;

    get target(): cc.Node {
        return this.targetNode ?? this.node;
    }

    private startPosition = cc.v3(0, 0);
    private startTouchLocation = cc.v3(0, 0);
    private startMouseLocation = cc.v3(0, 0);

    private isTouchStarted = false;
    private isMouseDragging = false;
    private currentX: number = 0;
    private currentY: number = 0;
    private initialX: number = 0;
    private initialY: number = 0;
    private parentX: string = "--";
    private parentY: string = "--";

    public touchCallback = {
        start: (node: cc.Node) => {},
        move: (touchPosition: cc.Vec2) => {},
        end: (isClicked: boolean) => {}
    };

    checkCollider(event): boolean {
        if (this.colliders.length === 0) {
            return true;
        }

        const touchLocation = event.touch.getLocation();
        return this.colliders.some((collider) => cc.Intersection.pointInPolygon(touchLocation, collider.world.points));
    }

    onLoad() {
        this.setupEventListeners();
        this.setupParentMessageListener();
    }

    setupEventListeners() {
        // Check device type to determine which events to register
        const isMobile = cc.sys.isMobile;
        const isDesktop = cc.sys.isBrowser && !isMobile;

        if (this.enableLogging) {
            console.log(
                `🎯 Setting up event listeners for: ${this.node.name} | Platform: ${cc.sys.platform} | Mobile: ${isMobile} | Desktop: ${isDesktop}`
            );
        }

        if (isMobile) {
            // Touch events for mobile devices
            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

            if (this.enableLogging) {
                console.log("📱 Registered touch events for mobile device");
            }
        } else if (isDesktop) {
            // Mouse events for desktop devices
            this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
            this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);

            if (this.enableLogging) {
                console.log("🖱️ Registered mouse events for desktop device");
            }
        } else {
            // Fallback: register both for unknown platforms
            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

            this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
            this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);

            if (this.enableLogging) {
                console.log("❓ Unknown platform, registered both touch and mouse events");
            }
        }
    }

    setupParentMessageListener() {
        if (!this.enableParentCommunication) return;

        // Listen for messages from parent window
        if (typeof window !== "undefined") {
            window.addEventListener("message", (event) => {
                const data = event.data;

                // Only process messages with iframe-drag-drop key
                if (!data || data.key !== "iframe-drag-drop") {
                    return;
                }

                if (this.enableLogging) {
                    const timestamp = new Date().toLocaleTimeString();
                    console.log(`[${timestamp}] 📥 Cocos received message from parent:`, data);
                }

                if (data.type === "parentPosition") {
                    this.parentX = data.x;
                    this.parentY = data.y;
                }
            });
        }
    }

    onTouchStart(e) {
        if (!this.checkCollider(e)) {
            if (this.enableLogging) {
                console.log("not touch in collider");
            }
            return;
        }

        this.isTouchStarted = true;
        const touchLocation = e.touch.getLocation();

        // Convert Cocos coordinates to web coordinates
        const webCoords = this.convertCocosToWebCoords(touchLocation);
        this.initialX = webCoords.x;
        this.initialY = webCoords.y;
        this.currentX = webCoords.x;
        this.currentY = webCoords.y;

        if (this.enableLogging) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(
                `[${timestamp}] 🖱️ TOUCH START - Cocos: (${touchLocation.x}, ${touchLocation.y}) Web: (${this.initialX}, ${this.initialY})`
            );
        }

        this.touchCallback.start(this.node);
        this.startPosition = this.target.position;
        this.startTouchLocation = touchLocation;

        this.sendToParent("dragStart", {
            clientX: this.currentX,
            clientY: this.currentY
        });
    }

    onTouchMove(e) {
        if (!this.isTouchStarted) {
            return;
        }

        const touchLocation = e.touch.getLocation();
        const previousX = this.currentX;
        const previousY = this.currentY;

        // Convert Cocos coordinates to web coordinates
        const webCoords = this.convertCocosToWebCoords(touchLocation);
        this.currentX = webCoords.x;
        this.currentY = webCoords.y;

        if (this.enableLogging) {
            const timestamp = new Date().toLocaleTimeString();
            const deltaX = this.currentX - previousX;
            const deltaY = this.currentY - previousY;
            console.log(
                `[${timestamp}] 🖱️ TOUCH MOVE - Cocos: (${touchLocation.x}, ${touchLocation.y}) Web: (${this.currentX}, ${this.currentY}) Delta: (${deltaX}, ${deltaY})`
            );
        }

        this.target.position = touchLocation.sub(this.startTouchLocation).add(this.startPosition);
        this.touchCallback.move(touchLocation);

        this.sendToParent("drag", {
            clientX: this.currentX,
            clientY: this.currentY,
            movementX: this.currentX - this.initialX,
            movementY: this.currentY - this.initialY
        });
    }

    onTouchEnd(e) {
        if (!this.isTouchStarted) {
            return;
        }

        this.isTouchStarted = false;
        const touchLocation = e.touch.getLocation();

        // Convert Cocos coordinates to web coordinates
        const webCoords = this.convertCocosToWebCoords(touchLocation);
        this.currentX = webCoords.x;
        this.currentY = webCoords.y;

        if (this.enableLogging) {
            const timestamp = new Date().toLocaleTimeString();
            const totalDeltaX = this.currentX - this.initialX;
            const totalDeltaY = this.currentY - this.initialY;
            const distance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);
            console.log(
                `[${timestamp}] 🖱️ TOUCH END - Cocos: (${touchLocation.x}, ${touchLocation.y}) Web: (${this.currentX}, ${this.currentY})`
            );
            console.log(`[${timestamp}] 📏 Total Movement: (${totalDeltaX}, ${totalDeltaY}) Distance: ${distance.toFixed(2)}px`);
        }

        this.touchCallback.end(e && this.isClicked(e));

        this.sendToParent("dragEnd", {});
    }

    onTouchCancel(e) {
        if (!this.isTouchStarted) {
            return;
        }
        this.isTouchStarted = false;
        this.touchCallback.end(false);
        this.sendToParent("dragEnd", {});
    }

    onMouseDown(e) {
        // Only handle if we're actually going to drag (within collider bounds)
        if (!this.checkCollider(e)) {
            if (this.enableLogging) {
                console.log("not mouse in collider");
            }
            return; // Let the event pass through to other nodes
        }

        this.isMouseDragging = true;
        const mouseLocation = e.getLocation();

        // Convert Cocos coordinates to web coordinates
        const webCoords = this.convertCocosToWebCoords(mouseLocation);
        this.initialX = webCoords.x;
        this.initialY = webCoords.y;
        this.currentX = webCoords.x;
        this.currentY = webCoords.y;

        if (this.enableLogging) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(
                `[${timestamp}] 🖱️ MOUSE DOWN - Cocos: (${mouseLocation.x}, ${mouseLocation.y}) Web: (${this.initialX}, ${this.initialY})`
            );
        }

        this.sendToParent("dragStart", {
            clientX: this.currentX,
            clientY: this.currentY
        });
    }

    onMouseMove(e) {
        if (!this.isMouseDragging) {
            return;
        }

        // Additional check to ensure we're still within collider bounds during drag
        if (!this.checkCollider(e)) {
            // If we moved outside the collider, stop dragging
            this.isMouseDragging = false;
            this.sendToParent("dragEnd", {});
            return;
        }

        const mouseLocation = e.getLocation();
        const previousX = this.currentX;
        const previousY = this.currentY;

        // Convert Cocos coordinates to web coordinates
        const webCoords = this.convertCocosToWebCoords(mouseLocation);
        this.currentX = webCoords.x;
        this.currentY = webCoords.y;

        if (this.enableLogging) {
            const timestamp = new Date().toLocaleTimeString();
            const deltaX = this.currentX - previousX;
            const deltaY = this.currentY - previousY;
            console.log(
                `[${timestamp}] 🖱️ MOUSE MOVE - Cocos: (${mouseLocation.x}, ${mouseLocation.y}) Web: (${this.currentX}, ${this.currentY}) Delta: (${deltaX}, ${deltaY})`
            );
        }

        this.sendToParent("drag", {
            clientX: this.currentX,
            clientY: this.currentY,
            movementX: this.currentX - this.initialX,
            movementY: this.currentY - this.initialY
        });
    }

    onMouseUp(e) {
        if (!this.isMouseDragging) {
            return;
        }

        this.isMouseDragging = false;
        const mouseLocation = e.getLocation();

        // Convert Cocos coordinates to web coordinates
        const webCoords = this.convertCocosToWebCoords(mouseLocation);
        this.currentX = webCoords.x;
        this.currentY = webCoords.y;

        if (this.enableLogging) {
            const timestamp = new Date().toLocaleTimeString();
            const totalDeltaX = this.currentX - this.initialX;
            const totalDeltaY = this.currentY - this.initialY;
            const distance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);
            console.log(
                `[${timestamp}] 🖱️ MOUSE UP - Cocos: (${mouseLocation.x}, ${mouseLocation.y}) Web: (${this.currentX}, ${this.currentY})`
            );
            console.log(`[${timestamp}] 📏 Total Movement: (${totalDeltaX}, ${totalDeltaY}) Distance: ${distance.toFixed(2)}px`);
        }

        this.sendToParent("dragEnd", {});
    }

    /**
     * Convert Cocos Creator coordinates to web browser coordinates
     * Cocos: Origin at center, Y-axis inverted
     * Web: Origin at top-left, Y-axis normal
     */
    convertCocosToWebCoords(cocosCoords: cc.Vec2): { x: number; y: number } {
        // Get the canvas element and its dimensions
        const canvas = cc.game.canvas;
        if (!canvas) {
            return { x: cocosCoords.x, y: cocosCoords.y };
        }

        const canvasRect = canvas.getBoundingClientRect();
        const canvasWidth = canvasRect.width;
        const canvasHeight = canvasRect.height;

        // Convert Cocos coordinates to web coordinates
        // Cocos origin is at center, web origin is at top-left
        // Cocos Y is inverted compared to web Y
        const webX = cocosCoords.x + canvasWidth / 2;
        const webY = canvasHeight / 2 - cocosCoords.y;

        return { x: webX, y: webY };
    }

    /**
     * Convert web browser coordinates to Cocos Creator coordinates
     * Web: Origin at top-left, Y-axis normal
     * Cocos: Origin at center, Y-axis inverted
     */
    convertWebToCocosCoords(webCoords: { x: number; y: number }): cc.Vec2 {
        // Get the canvas element and its dimensions
        const canvas = cc.game.canvas;
        if (!canvas) {
            return cc.v2(webCoords.x, webCoords.y);
        }

        const canvasRect = canvas.getBoundingClientRect();
        const canvasWidth = canvasRect.width;
        const canvasHeight = canvasRect.height;

        // Convert web coordinates to Cocos coordinates
        // Web origin is at top-left, Cocos origin is at center
        // Web Y is normal, Cocos Y is inverted
        const cocosX = webCoords.x - canvasWidth / 2;
        const cocosY = canvasHeight / 2 - webCoords.y;

        return cc.v2(cocosX, cocosY);
    }

    isClicked(e): boolean {
        const delta = e.touch.getLocation().sub(this.startTouchLocation);
        return Math.abs(delta.x) + Math.abs(delta.y) < 10;
    }

    sendToParent(eventType: string, data: any) {
        if (!this.enableParentCommunication || typeof window === "undefined") {
            return;
        }

        const message = {
            key: "iframe-drag-drop",
            type: eventType,
            source: "cocos-creator",
            nodeName: this.node.name,
            ...data
        };

        if (this.enableLogging) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}] 📤 Cocos sending to parent:`, message);
        }

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, "*");
        }
    }

    onDestroy() {
        // Clean up event listeners based on device type
        const isMobile = cc.sys.isMobile;
        const isDesktop = cc.sys.isBrowser && !isMobile;

        if (isMobile) {
            // Remove touch events for mobile devices
            this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        } else if (isDesktop) {
            // Remove mouse events for desktop devices
            this.node.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
            this.node.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.node.off(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            // Remove both for unknown platforms
            this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
            this.node.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
            this.node.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
            this.node.off(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }
}

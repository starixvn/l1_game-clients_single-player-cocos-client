class FullScreenManager {
    timeoutDelayEnableScroll = null;
    timeoutExtraResize = null;
    constructor() {
        this.isInIframe = window !== window.top;
        this.IOSInstruction = document.getElementById("ios-instruction");
        this.androidInstruction = document.getElementById("android-instruction");
        this.iconFullScreen = document.getElementById("icon-fullscreen");
        this.userAgent = window.navigator.userAgent;
        this.isIOS = /(ipad|iphone|ipod)/i.test(this.userAgent);
        this.isAndroid = /android/i.test(this.userAgent);
        this.isIPad = /ipad/i.test(this.userAgent);
        this.webview = /wv/i.test(this.userAgent);
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    isPortrait() {
        return window.outerHeight > window.outerWidth;
    }

    triggerEventResize() {
        clearTimeout(this.timeoutExtraResize);
        this.timeoutExtraResize = setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 500);
    }

    getMiniNavigationBarHeight() {
        let navBarHeight = 0;
        if (!this.isPortrait()) {
            navBarHeight = 25;
            if (this.isIPad) {
                navBarHeight = 40;
            }
        }
        return navBarHeight;
    }

    isShowAddressBar() {
        const minNavigationBarHeight = this.getMiniNavigationBarHeight();
        const outerHeight = Math.min(screen.width, screen.height);
        const deltaHeight = outerHeight - window.innerHeight;
        return deltaHeight > minNavigationBarHeight;
    }

    syncPositionForGameContainer() {
        const gameContainer = document.getElementById("Cocos2dGameContainer");
        if (gameContainer) {
            gameContainer.style.top = window.scrollY + "px";
        }
    }

    scrollToTop(top = 0) {
        window.scrollTo({
            top,
            behavior: "instant"
        });
        document.documentElement.style.setProperty("--scrollY", `${top}px`);
        this.syncPositionForGameContainer();
    }

    updateViewport() {
        const viewportUnit = "--vh";
        if (this.isIOS || this.isAndroid) {
            const height = Math.min(window.innerWidth, window.innerHeight);
            const vh = height * 0.01;
            document.documentElement.style.setProperty(viewportUnit, `${vh}px`);
        } else {
            document.documentElement.style.setProperty(viewportUnit, `1%`);
        }
        document.documentElement.style.setProperty("--height-50vh", `${window.innerHeight / 2}px`);
    }

    showIOSInstruction(isShow = true) {
        clearTimeout(this.timeoutDelayEnableScroll);
        this.IOSInstruction.style.display = "block";
        this.IOSInstruction.style.visibility = isShow ? "visible" : "hidden";
    }

    updateFullScreen() {
        if (this.isPortrait()) {
            this.updateViewport();
            this.scrollToTop(200);
            this.showIOSInstruction(false);
            return;
        }
        const isShowAddressBar = this.isShowAddressBar();
        if (!isShowAddressBar) {
            this.showIOSInstruction(false);
        }
        this.updateViewport();
        this.syncPositionForGameContainer();
    }

    registerEventFullScreenForIOS() {
        const debouncedUpdateFullScreen = this.debounce(this.updateFullScreen, 100);

        window.addEventListener("orientationchange", () => {
            if (document.getElementById("microsite")) {
                this.triggerEventResize();
            } else {
                debouncedUpdateFullScreen();
            }
        });
        window.addEventListener("resize", debouncedUpdateFullScreen);
        window.addEventListener("scroll", debouncedUpdateFullScreen, true);
    }

    onClickFullScreenForIOS() {
        this.showIOSInstruction(true);
        this.scrollToTop();
        this.updateViewport();
    }

    requestFullScreen() {
        const doc = window.document;
        const docEl = document.documentElement;

        const requestFullScreen =
            docEl.webkitEnterFullscreen ||
            docEl.requestFullscreen ||
            docEl.mozRequestFullScreen ||
            docEl.webkitRequestFullScreen ||
            docEl.msRequestFullscreen;

        if (
            !doc.fullscreenElement &&
            !doc.mozFullScreenElement &&
            !doc.webkitFullscreenElement &&
            !doc.msFullscreenElement &&
            requestFullScreen
        ) {
            requestFullScreen.call(docEl);
        }
    }

    isFullScreen() {
        if (this.isIOS) {
            return !this.isShowAddressBar();
        }
        if (this.isAndroid) {
            return this.webview || screen.height - window.innerHeight < 10;
        }
        return true;
    }

    registerEventFullScreenIcon(isShow = true) {
        this.iconFullScreen.onclick = !isShow
            ? null
            : () => {
                  if (this.isIPad) {
                      this.requestFullScreen();
                      return;
                  }
                  if (this.isIOS) {
                      this.onClickFullScreenForIOS();
                  }
                  if (this.isAndroid) {
                      const handleFullscreenForAndroid = this.webview ? this.updateViewport : this.requestFullScreen;
                      handleFullscreenForAndroid();
                  }
              };
    }

    updateIconFullScreen() {
        if (this.isPortrait() || this.isFullScreen() || this.isInIframe) {
            this.iconFullScreen.style.display = "none";
            this.registerEventFullScreenIcon(false);
        } else {
            this.iconFullScreen.style.display = "block";
            const topIcon = window.scrollY + 10;
            this.iconFullScreen.style.top = (topIcon > 0 ? topIcon : 0) + "px";
            this.registerEventFullScreenIcon(true);
        }
    }

    initForIOS() {
        this.showIOSInstruction(false);
        this.updateViewport();
        this.syncPositionForGameContainer();
        this.registerEventFullScreenForIOS();
        if (this.isPortrait()) {
            this.scrollToTop(200);
        }
        document.body.style.overflow = "auto";
    }

    initForAndroid() {
        this.updateViewport();
        if (!this.webview) {
            const debouncedUpdateViewport = this.debounce(this.updateViewport, 100);
            window.addEventListener("resize", debouncedUpdateViewport);
        }
    }

    init() {
        try {
            if (this.isIOS || this.isAndroid) {
                this.isIOS && this.initForIOS();
                this.isAndroid && this.initForAndroid();
                this.updateIconFullScreen();
                const debouncedUpdateIconFullScreen = this.debounce(this.updateIconFullScreen, 100);
                window.addEventListener("resize", debouncedUpdateIconFullScreen);
                window.addEventListener("orientationchange", debouncedUpdateIconFullScreen);
                this.isIOS && window.addEventListener("scroll", debouncedUpdateIconFullScreen);
            }
        } catch (error) {
            console.error("Error initializing full screen handler:", error);
        }
    }
}

const fullScreenManager = new FullScreenManager();
fullScreenManager.init();

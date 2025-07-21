import ColorAssembler2D from "../../../assets/common/ColorAssembler2D";
import ChunkedFontLoader, { FontLoadProgress } from "../utils/ChunkedFontLoader";
const { ccclass, property, menu } = cc._decorator;

const LanguageFont = cc.Class({
    name: "LanguageFont",
    properties: {
        language: "",
        name: ""
    }
});

@ccclass
@menu("i18n/LocalizedFont")
export default class LocalizedFont extends cc.Component {
    @property({ type: [LanguageFont] })
    overrideFonts: any[] = [];

    @property
    enableCacheMode = false;

    label: cc.Label = null;
    color2D: ColorAssembler2D = null;
    fontBases = {};

    onLoad() {
        this.initData();
        this.label = this.node.getComponent(cc.Label);
        this.color2D = this.node.getComponent(ColorAssembler2D);
        this.updateFont();
    }

    initData() {
        this.fontBases = {
            vi: "PingFang-Regular",
            id: "PingFang-Regular",
            en: "PingFang-Regular",
            th: "PingFang-Regular",
            zh_cn: "PingFangRegular",
            zh_tw: "PingFang-Regular"
        };
    }

    updateFont() {
        const name = this.getFontNameByLanguage();
        if (this.label) {
            this.loadFont(name).then((font) => {
                if (this.label && this.label.isValid) {

                    this.label.font = font;
                    this.enableCacheMode && this.handleCacheMode();
                }

                this.color2D && this.color2D.updateColors();
            });
        }
    }

    handleCacheMode() {
        const lang = window.i18n.curLang;
        switch (lang) {
            case "th":
            case "zh_cn":
            case "zh_tw":
                this.label.cacheMode = cc.Label.CacheMode.BITMAP;
                break;

            default:
                this.label.cacheMode = cc.Label.CacheMode.CHAR;
                break;
        }
    }

    getFontNameByLanguage(): any {
        const lang = window.i18n.curLang;
        const overrideFonts = this.overrideFonts.find((data) => data.language === lang);
        return overrideFonts?.name || this.fontBases[lang] || this.fontBases["en"];
    }

    loadFont(name: string) {
        return new Promise<cc.Font>((resolve, reject) => {
            // Try chunked font loading first, then fallback to regular loading
            ChunkedFontLoader.loadFont(name, {
                useChunkedFont: true,
                fallbackToRegular: true,
                enableTiming: true, // Enable timing for analysis
                onProgress: (progress: FontLoadProgress) => {
                    const elapsedStr = progress.elapsedTime ? ` (${(progress.elapsedTime / 1000).toFixed(1)}s)` : '';
                    const etaStr = progress.estimatedTimeRemaining ? ` ETA: ${(progress.estimatedTimeRemaining / 1000).toFixed(1)}s` : '';
                    console.log(`[LocalizedFont] Loading font ${name}: ${progress.percentage.toFixed(1)}% (${progress.currentChunk}/${progress.totalChunks})${elapsedStr}${etaStr}`);
                },
                onTimingComplete: (timing) => {
                    console.log(`[LocalizedFont] Font ${name} timing analysis:`);
                    console.log(`  Total: ${(timing.totalDuration! / 1000).toFixed(2)}s`);
                    console.log(`  Metadata: ${(timing.metadataLoadTime! / 1000).toFixed(2)}s`);
                    console.log(`  Chunks: ${(timing.phases.chunks.duration! / 1000).toFixed(2)}s`);
                    console.log(`  Merge: ${(timing.mergeTime! / 1000).toFixed(2)}s`);
                    console.log(`  Font Creation: ${(timing.fontCreationTime! / 1000).toFixed(2)}s`);
                }
            }).then(resolve).catch((error) => {
                console.warn(`[LocalizedFont] Chunked font loading failed for ${name}, using regular loading:`, error);
                // Fallback to regular loading
                cc.resources.load<cc.Font>(`fonts/${name}`, cc.Font, (err, font) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(font);
                    }
                });
            });
        });
    }
}

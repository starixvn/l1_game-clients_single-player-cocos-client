"use strict";

const fs = require("fs");
const path = require("path");
const Font = require("fonteditor-core").Font;
const woff2 = require("fonteditor-core").woff2;

const woff2_load_code = `
cc.assetManager.downloader.register('.woff2', (url, options, onComplete) => {
    const fixedUrl = url.replace(/\\.woff2$/, \`/\${options.__nativeName__}\`);
    console.log('[Font] Downloading font:', options.__nativeName__, 'from:', fixedUrl);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', fixedUrl, true);
    xhr.responseType = 'arraybuffer';
    xhr.setRequestHeader('Accept', 'font/woff2');
    xhr.onload = function() {
        xhr.status === 200 || xhr.status === 0 ? 
            onComplete(null, xhr.response) : 
            onComplete(new Error(\`\${xhr.status}(\${xhr.statusText})\`));
    };
    xhr.onerror = function() {
        onComplete(new Error(xhr.statusText));
    };
    xhr.ontimeout = function() {
        onComplete(new Error('timeout'));
    };
    xhr.send(null);
});

cc.assetManager.parser.register('.woff2', (file, options, onComplete) => {
    const fontFamily = options.__nativeName__.replace(/\\.woff2$/, '');
    console.log('[Font] Parsing font:', fontFamily);
    const fontFace = new FontFace(fontFamily, file);
    document.fonts.add(fontFace);
    fontFace.load().then(() => {
        onComplete(null, fontFamily);
    }).catch(() => {
        cc.warnID(4933, fontFamily);
        onComplete(null, fontFamily);
    });
});`;

function onBuildStart(options, callback) {
    // Editor.log('[woff2-cvt] Build Start');
    callback();
}

async function onBuildFinished(options, callback) {
    // Editor.log('[woff2-cvt] Received build finished event:', options);

    if (!options || !options.platform) {
        Editor.warn("[woff2-cvt] Invalid build options");
        callback && callback();
        return;
    }

    Editor.log("[woff2-cvt] Build platform:", options.platform);
    Editor.log("[woff2-cvt] Build directory:", options.dest);

    // Only process web-mobile platform
    if (options.platform !== "web-mobile") {
        Editor.log("[woff2-cvt] Skip non web-mobile platform");
        callback && callback();
        return;
    }

    Editor.log("[woff2-cvt] Start converting fonts...");
    try {
        await processWebMobile(options.dest);
        Editor.log(`[woff2-cvt] Conversion completed`);
    } catch (err) {
        Editor.error("[woff2-cvt] Conversion failed:", err);
    }

    callback && callback();
}

// Recursively search directory, but only return PingFang-Bold.ttf and PingFang-Regular.ttf
function searchTTFFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(searchTTFFiles(fullPath));
        } else if (file === "PingFang-Bold.ttf" || file === "PingFang-Regular.ttf") {
            results.push(fullPath);
        }
    }

    return results;
}

async function processWebMobile(buildPath) {
    Editor.log("[woff2-cvt] Processing directory:", buildPath);

    try {
        await woff2.init();

        const assetsDir = path.join(buildPath, "assets");
        Editor.log("[woff2-cvt] Searching for TTF files:", assetsDir);

        if (!fs.existsSync(assetsDir)) {
            Editor.warn("[woff2-cvt] Resource directory not found");
            return;
        }

        const ttfFiles = searchTTFFiles(assetsDir);
        Editor.log("[woff2-cvt] Found the following TTF files:", ttfFiles);

        // 2. Convert each found TTF file, but check ./fonts for existing woff2 first
        const fontsDir = path.join(__dirname, "fonts");
        for (const ttfPath of ttfFiles) {
            const fileName = path.basename(ttfPath, ".ttf");
            const woff2Path = ttfPath.replace(".ttf", ".woff2");
            const woff2SourcePath = path.join(fontsDir, fileName + ".woff2");

            try {
                let woff2Buffer;
                if (fs.existsSync(woff2SourcePath)) {
                    // Use the woff2 file from ./fonts
                    Editor.log(`[woff2-cvt] Using existing WOFF2 from ./fonts:`, woff2SourcePath);
                    woff2Buffer = fs.readFileSync(woff2SourcePath);
                } else {
                    // Read TTF file and convert
                    Editor.log("[woff2-cvt] Reading TTF file:", ttfPath);
                    const buffer = fs.readFileSync(ttfPath);
                    const font = Font.create(buffer, {
                        type: "ttf",
                        hinting: true
                    });
                    woff2Buffer = font.write({
                        type: "woff2",
                        hinting: true
                    });
                    Editor.log(`[woff2-cvt] Converted to WOFF2:`, woff2Path);
                }

                // Write the woff2 file (from ./fonts or conversion)
                fs.writeFileSync(woff2Path, woff2Buffer);
                Editor.log(`[woff2-cvt] WOFF2 written:`, woff2Path);

                // Delete original TTF file
                fs.unlinkSync(ttfPath);
                Editor.log(`[woff2-cvt] Deleted original TTF file:`, ttfPath);
            } catch (err) {
                Editor.error("[woff2-cvt] Conversion error:", ttfPath, err);
            }
        }

        // 3. Update all files that may contain font references
        const filesToUpdate = [
            path.join(buildPath, "index.html"),
            path.join(buildPath, "style-mobile.css"),
            ...searchFiles(buildPath, [".css", ".json"])
        ];

        // Exclude file patterns that do not need to be processed
        const excludePatterns = [];

        // Deduplicate and filter
        const uniqueFiles = [...new Set(filesToUpdate)].filter((file) => {
            const fileName = path.basename(file);
            // If the file name matches any exclude pattern, do not process the file
            return !excludePatterns.some((pattern) => pattern.test(fileName));
        });

        for (const filePath of uniqueFiles) {
            if (fs.existsSync(filePath)) {
                try {
                    let content = fs.readFileSync(filePath, "utf8");
                    let originalContent = content;
                    let modified = false;

                    if (filePath.endsWith(".json")) {
                        // Special handling for JSON files
                        try {
                            let jsonContent = JSON.parse(content);
                            const processJsonValue = (obj) => {
                                if (typeof obj === "object") {
                                    for (let key in obj) {
                                        if (typeof obj[key] === "string") {
                                            if (obj[key].includes("PingFang-Bold.ttf")) {
                                                obj[key] = obj[key].replace("PingFang-Bold.ttf", "PingFang-Bold.woff2");
                                                modified = true;
                                            }
                                            if (obj[key].includes("PingFang-Regular.ttf")) {
                                                obj[key] = obj[key].replace("PingFang-Regular.ttf", "PingFang-Regular.woff2");
                                                modified = true;
                                            }
                                        } else if (typeof obj[key] === "object") {
                                            processJsonValue(obj[key]);
                                        }
                                    }
                                }
                            };

                            processJsonValue(jsonContent);
                            if (modified) {
                                content = JSON.stringify(jsonContent, null, 2);
                            }
                        } catch (jsonErr) {
                            Editor.error(`[woff2-cvt] Failed to parse JSON ${filePath}:`, jsonErr);
                        }
                    } else {
                        // Only replace PingFang-Bold.ttf and PingFang-Regular.ttf with .woff2
                        let replaced = content;
                        replaced = replaced.replace(/PingFang-Bold\.ttf/g, "PingFang-Bold.woff2");
                        replaced = replaced.replace(/PingFang-Regular\.ttf/g, "PingFang-Regular.woff2");
                        if (replaced !== content) {
                            content = replaced;
                            modified = true;
                        }

                        // Special handling for format declaration in CSS, but only for PingFang-Bold and PingFang-Regular
                        if (filePath.endsWith(".css")) {
                            // Only replace format for these two fonts
                            const fontFaceRegex = /@font-face\s*{[^}]*font-family:\s*['"]?(PingFang-Bold|PingFang-Regular)['"]?[^}]*}/g;
                            content = content.replace(fontFaceRegex, (block) => {
                                return block.replace(/format\(['"]truetype['"]\)/g, 'format("woff2")');
                            });
                            if (content !== replaced) {
                                modified = true;
                            }
                        }
                    }

                    // Only write if content has changed
                    if (modified) {
                        fs.writeFileSync(filePath, content);
                        Editor.log(`[woff2-cvt] Updated font reference: ${filePath}`);
                    }
                } catch (err) {
                    Editor.error(`[woff2-cvt] Update failed ${filePath}:`, err);
                }
            }
        }

        // Search for main.*.js, insert woff2_load_code at the end of the onStart function body
        const mainJsFiles = fs
            .readdirSync(buildPath)
            .filter((file) => /^main\.[a-f0-9]+\.js$/.test(file))
            .map((file) => path.join(buildPath, file));

        if (mainJsFiles.length > 0) {
            const mainJsPath = mainJsFiles[0];
            Editor.log("[woff2-cvt] Found main.js:", mainJsPath);

            try {
                let content = fs.readFileSync(mainJsPath, "utf8");

                // Modify the matching pattern to adapt to var onStart = function ()
                const onStartMatch = content.match(/var\s+onStart\s*=\s*function\s*\([^)]*\)\s*{/);
                if (onStartMatch) {
                    const startPos = onStartMatch.index;
                    let bracketCount = 0;
                    let endPos = startPos;

                    // Find the position of the matching closing bracket
                    for (let i = startPos; i < content.length; i++) {
                        if (content[i] === "{") bracketCount++;
                        if (content[i] === "}") bracketCount--;
                        if (bracketCount === 0) {
                            endPos = i;
                            break;
                        }
                    }

                    // Insert code at the end of the function
                    const newContent = content.slice(0, endPos) + "\n" + woff2_load_code + "\n" + content.slice(endPos);

                    fs.writeFileSync(mainJsPath, newContent);
                    Editor.log("[woff2-cvt] Injected WOFF2 loading code");
                } else {
                    Editor.warn("[woff2-cvt] onStart function not found");
                }
            } catch (err) {
                Editor.error("[woff2-cvt] Code injection failed:", err);
            }
        } else {
            Editor.warn("[woff2-cvt] main.*.js file not found");
        }

        Editor.log("[woff2-cvt] All processing completed");
    } catch (err) {
        Editor.error("[woff2-cvt] Processing error:", err);
    }
}

// Recursively search files with specified extensions
function searchFiles(dir, extensions) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(searchFiles(fullPath, extensions));
        } else if (extensions.some((ext) => file.endsWith(ext))) {
            results.push(fullPath);
        }
    }

    return results;
}

module.exports = {
    load() {
        Editor.log("[woff2-cvt] Plugin loaded");
        Editor.Builder.on("build-start", onBuildStart);
        Editor.Builder.on("build-finished", onBuildFinished);
    },

    unload() {
        Editor.Builder.removeListener("build-start", onBuildStart);
        Editor.Builder.removeListener("build-finished", onBuildFinished);
    },

    messages: {
        "woff2-cvt:convert"() {
            Editor.log("[woff2-cvt] Manual conversion triggered");
            const buildPath = path.join(Editor.Project.path, "build/web-mobile");
            if (fs.existsSync(buildPath)) {
                processWebMobile(buildPath);
            } else {
                Editor.warn("[woff2-cvt] Please build the web-mobile platform first");
            }
        },
        "woff2-cvt:open"() {
            Editor.Panel.open("woff2-cvt");
        }
    }
};

# WOFF2-CVT

English | [简体中文](./README.zh.md)

## Introduction

WOFF2-CVT is a font auto-conversion plugin for Cocos Creator. It automatically converts TTF font files to WOFF2 format during project build, significantly reducing font file size (typically over 60% reduction) to optimize game loading performance. No manual operation required - just install the plugin and the conversion happens automatically.

## Key Features

- Automatic Conversion: Converts TTF fonts to WOFF2 format during build
- Maximum Compression: Reduces font file size by over 60%
- Zero Configuration: No manual setup needed, works out of the box
- Quality Preservation: Maintains font display quality while reducing size
- High Compatibility: WOFF2 format is widely supported by modern browsers

## How to Use

### Plugin Installation

#### Editor Version >= 2.4.x

1. Open Extension Manager from the main menu
2. Search and install the "WOFF2-CVT" plugin

#### Editor Version <= 2.4.14

1. Download and place the plugin in the designated location:
   - Global installation: `User/.CocosCreator/extensions`
   - Project installation: `extensions` folder in your project directory

2. Enable the plugin:
   - Open Extension Manager
   - Refresh the list
   - Enable WOFF2-CVT plugin

### Usage Instructions

1. After installation and activation, no additional configuration is needed
2. Build your project normally, and the plugin will process all TTF font files
3. The converted WOFF2 files will automatically replace the original TTF files
4. If the code insertion fails, insert the code yourself in main.js
```javascript
    // 在游戏启动时添加
    // 注册 woff2 下载器
    cc.assetManager.downloader.register('.woff2', (url, options, onComplete) => {
        // 修复 URL，将原始文件名加回去
        const fixedUrl = url.replace(/\.woff2$/, `/${options.__nativeName__}`);
        console.log('[Font] Downloading font:', options.__nativeName__, 'from:', fixedUrl);

        const xhr = new XMLHttpRequest();
        xhr.open('GET', fixedUrl, true);
        xhr.responseType = 'arraybuffer';
        
        // 设置 MIME 类型
        xhr.setRequestHeader('Accept', 'font/woff2');
        
        xhr.onload = function () {
            if (xhr.status === 200 || xhr.status === 0) {
                onComplete(null, xhr.response);
            } else {
                onComplete(new Error(`${xhr.status}(${xhr.statusText})`));
            }
        };
        
        xhr.onerror = function () {
            onComplete(new Error(xhr.statusText));
        };
        
        xhr.ontimeout = function () {
            onComplete(new Error('timeout'));
        };
        
        xhr.send(null);
    });

    // 注册解析器
    cc.assetManager.parser.register('.woff2', (file, options, onComplete) => {
        // 使用原始文件名作为字体名（去掉扩展名）
        const fontFamily = options.__nativeName__.replace(/\.woff2$/, '');
        console.log('[Font] Parsing font:', fontFamily);

        // 直接使用 ArrayBuffer 创建 FontFace
        const fontFace = new FontFace(fontFamily, file);
        document.fonts.add(fontFace);

        fontFace.load().then(() => {
            onComplete(null, fontFamily);
        }).catch(() => {
            cc.warnID(4933, fontFamily);
            onComplete(null, fontFamily);
        });
    });
```
## Performance Benefits

- File Size: Over 60% reduction compared to TTF format
- Loading Speed: Smaller file size means faster loading times
- Memory Usage: Lower memory consumption, better runtime performance

## Common Issues

If you encounter any issues:
1. [Visit the forum](https://forum.cocos.org/)
2. Check browser compatibility
3. Verify that font files are in TTF format

## Technical Support

If you encounter any problems during use:
- Send an email to: 494294315@qq.com

## License

This project is licensed under the MIT License


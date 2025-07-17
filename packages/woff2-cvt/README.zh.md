# WOFF2-CVT

[English](./README.md) | 简体中文

## 简介

WOFF2-CVT 是一个用于 Cocos Creator 的字体自动转换插件。它可以在项目打包时自动将 TTF 字体文件转换为 WOFF2 格式，显著减少字体文件体积（通常可减少 60% 以上），从而优化游戏加载性能。无需任何手动操作，只需安装插件即可自动完成转换。

## 主要功能

- 自动转换：打包时自动将 TTF 字体转换为 WOFF2 格式
- 极致压缩：字体文件体积减少 60% 以上
- 零配置：无需任何手动设置，即装即用
- 保持质量：在减小体积的同时保持字体显示质量
- 兼容性好：WOFF2 格式被现代浏览器广泛支持

## 如何使用

### 安装插件

#### 编辑器版本 >= 2.3.x

1. 通过主菜单打开扩展管理器
2. 搜索并安装 "WOFF2-CVT" 插件

#### 编辑器版本 <= 2.4.14

1. 下载插件并放置到指定位置：
   - 全局安装：`用户/.CocosCreator/extensions`
   - 项目安装：项目目录下的 `extensions` 文件夹

2. 启用插件：
   - 打开扩展管理器
   - 刷新列表
   - 启用 WOFF2-CVT 插件

### 使用说明

1. 安装并启用插件后，无需任何额外配置
2. 正常进行项目打包，插件会自动处理所有 TTF 字体文件
3. 转换后的 WOFF2 文件会自动替换原有的 TTF 文件
4. 如果插入代码不成功，则自行在main.js插入代码
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


## 性能优势

- 文件体积：比 TTF 格式减少 60% 以上
- 加载速度：更小的文件体积意味着更快的加载速度
- 内存占用：更低的内存占用，更好的运行性能

## 常见问题

如果遇到问题，可以：
1. [访问论坛](https://forum.cocos.org/)
2. 检查浏览器兼容性
3. 确认字体文件格式是否为 TTF

## 技术支持

如果在使用过程中遇到问题，可以：
- 发送邮件至：494294315@qq.com

## 许可证

该项目遵循 MIT 许可证
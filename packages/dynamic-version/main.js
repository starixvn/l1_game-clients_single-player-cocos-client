var path = require("path");
var fs = require("fs");

function onBeforeBuildFinish(options, callback) {
    Editor.log("Building " + options.platform + " to " + options.dest);

    modifyHtmlTemplate(options);

    callback();
}

function modifyHtmlTemplate(options) {
    const indexHtmlFilePath = path.join(options.dest, "index.html");
    const htmlContent = fs.readFileSync(indexHtmlFilePath, "utf8");

    const getScriptTag = (src) => `<script type="text/javascript" src="${src}"></script>`;
    const getCssTag = (src) => `<link rel="stylesheet" type="text/css" href="${src}" />`;
    const version = new Date().getTime();
    const newHtmlContent = htmlContent
        .replace(getScriptTag("./c/c.js"), getScriptTag(`./c/c.js?v=${version}`))
        .replace(getScriptTag("./full-screen/full-screen.js"), getScriptTag(`./full-screen/full-screen.js?v=${version}`))
        .replace(getCssTag("./splash-resources/style-mobile.css"), getCssTag(`./splash-resources/style-mobile.css?v=${version}`))
        .replace(getCssTag("./full-screen/style.css"), getCssTag(`./full-screen/style.css?v=${version}`));

    fs.writeFileSync(indexHtmlFilePath, newHtmlContent);
}

module.exports = {
    load() {
        Editor.Builder.on("before-change-files", onBeforeBuildFinish);
    },

    unload() {
        Editor.Builder.removeListener("before-change-files", onBeforeBuildFinish);
    }
};

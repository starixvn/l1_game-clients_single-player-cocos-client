var path = require("path");
var fs = require("fs");
var packageUtils = require("./utils/package");
var buildFinishedEvent = "build-finished";
function onBuildFinished(options, callback) {
    var destination = path.join(options.dest, "assets/versions.json");
    var versions = options.settings.bundleVers;
    fs.writeFileSync(destination, JSON.stringify(versions || {}));
    callback();
}
module.exports = {
    load: function () {
        Editor.Builder.on(buildFinishedEvent, onBuildFinished);
        packageUtils.mount();
    },
    unload: function () {
        Editor.Builder.off(buildFinishedEvent, onBuildFinished);
    },
};

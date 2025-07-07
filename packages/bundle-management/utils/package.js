var fs = require("fire-fs");
var path = require("path");
var mount = function () {
    var projectPath = Editor.projectPath || Editor.Project.path;
    var resourcePath = path.join(projectPath, "assets/resources");
    var filePath = path.join(resourcePath, "bundle-information.js");
    var templatePath = path.join(__dirname, "template.txt");
    if (!fs.existsSync(resourcePath)) {
        fs.ensureDirSync(resourcePath);
    }
    if (!fs.existsSync(filePath)) {
        fs.copyFileSync(templatePath, filePath);
    }
};
exports.mount = mount;

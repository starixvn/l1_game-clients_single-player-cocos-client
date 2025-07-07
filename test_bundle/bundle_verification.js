const fse = require("fs-extra");
const glob = require("glob");
const decodeUuid = require("./decode-uuid");
function bundleVerification() {
    let exitCode = 0;
    const assetsDirPath = "./build/web-mobile/assets";
    const versions = fse.readJsonSync(`${assetsDirPath}/versions.json`);

    const microBundles = Object.keys(versions).filter((key) => !["main", "resources", "internal"].includes(key));
    const uuidInfo = {};
    const realEntries = {};

    const mainAndMicroBundles = ["main", "resources", ...microBundles];
    mainAndMicroBundles.forEach((bundleId) => {
        const config = fse.readJsonSync(`${assetsDirPath}/${bundleId}/config.${versions[bundleId]}.json`);
        const { paths } = config;
        for (let id in paths) {
            let entry = paths[id];
            realEntries[config.uuids[id]] = entry;
        }

        const redirect = config.redirect;
        const uuids = [];
        const redirectUuids = [];
        uuidInfo[bundleId] = uuids;

        for (var i = 0, l = redirect.length; i < l; i += 2) {
            const index = redirect[i];
            redirectUuids.push(config.uuids[index]);
        }

        config.uuids.forEach((id) => {
            if (!redirectUuids.includes(id)) {
                uuids.push(id);
            }
        });
    });

    const { bundlePaths, pathInfo } = getPathsInfo();
    const duplicatedUuidList = [];
    if (
        checkDuplicatedUuids(microBundles, uuidInfo, duplicatedUuidList, realEntries) ||
        checkOuterBundleResources(microBundles, uuidInfo, duplicatedUuidList, bundlePaths, pathInfo) ||
        checkPackResourcesFromMicroGameBundle(microBundles, uuidInfo, bundlePaths, pathInfo)
    ) {
        exitCode = 1;
    }

    process.exit(exitCode);
}

function checkPackResourcesFromMicroGameBundle(microBundles, uuidInfo, bundlePaths, pathInfo) {
    let exitCode = 0;
    ["main", "resources"].forEach((bundleId) => {
        const uuids = uuidInfo[bundleId];
        const wrongPackUuids = [];
        uuids.forEach((uuid) => {
            const decodeId = decodeUuid(uuid);
            const filePath = pathInfo[decodeId];
            if (!filePath) {
                return;
            }
            microBundles.forEach((bundleId) => {
                const bundlePath = bundlePaths[bundleId];
                if (filePath.includes(bundlePath)) {
                    wrongPackUuids.push(decodeUuid(uuid));
                }
            });
        });

        if (wrongPackUuids.length > 0) {
            console.log(`${bundleId} bundle pack resources in other bundle:`);
            console.log(wrongPackUuids);
            exitCode = 1;
        }
    });

    return exitCode;
}

function checkDuplicatedUuids(microBundles, uuidInfo, duplicatedUuidList, realEntries) {
    let exitCode = 0;
    microBundles.forEach((bundleId) => {
        const uuids = uuidInfo[bundleId];
        uuids.forEach((uuid) => {
            microBundles.forEach((othersBundleId) => {
                if (othersBundleId !== bundleId) {
                    if (!duplicatedUuidList.includes(uuid) && uuidInfo[othersBundleId].includes(uuid)) {
                        duplicatedUuidList.push(uuid);
                    }
                }
            });
        });
    });

    if (duplicatedUuidList.length > 0) {
        console.log("Duplicated UUID list: ");
        duplicatedUuidList.forEach((id) => {
            const decompressedUuid = decodeUuid(id);
            console.log(`${decompressedUuid} --- ${id} --- ${realEntries[id]}`);
        });
        exitCode = 1;
    }
    return exitCode;
}

function checkOuterBundleResources(bundleList, uuidInfo, duplicatedUuidList, bundlePaths, pathInfo) {
    let exitCode = 0;

    const outerBundleDirFiles = [];
    const notFoundUuids = [];
    bundleList.forEach((bundleId) => {
        const uuids = uuidInfo[bundleId];
        const bundlePath = bundlePaths[bundleId];
        uuids.forEach((uuid) => {
            if (!duplicatedUuidList.includes(uuid)) {
                const decodeId = decodeUuid(uuid);
                const filePath = pathInfo[decodeId];
                if (!filePath) {
                    notFoundUuids.push(decodeId);
                    return;
                }

                if (!filePath.includes(bundlePath)) {
                    outerBundleDirFiles[filePath] = true;
                }
            }
        });
    });
    const outerBundleFiles = Object.keys(outerBundleDirFiles);
    if (outerBundleFiles.length > 0) {
        console.log("Resources are out of bundle's folder:");
        console.log(outerBundleFiles);
        exitCode = 1;
    }

    if (notFoundUuids.length > 0) {
        console.log("Missing resources UUID list:");
        console.log(notFoundUuids);
        exitCode = 1;
    }
    return exitCode;
}

function getPathsInfo() {
    const metaFilePaths = glob.sync("assets/**/*!(.ts).meta");
    const pathInfo = {};
    const bundlePaths = {};
    metaFilePaths.forEach((metaPath) => {
        const data = fse.readJsonSync(metaPath);
        const shortPath = metaPath.split(".meta")[0];
        pathInfo[data.uuid] = shortPath;

        Object.keys(data.subMetas).forEach((key) => {
            pathInfo[data.subMetas[key].uuid] = `${shortPath}/${key}`;
        });

        if (data.bundleName && data.bundleName !== "resources") {
            bundlePaths[data.bundleName] = shortPath;
        }
    });
    return { bundlePaths, pathInfo };
}

bundleVerification();

interface AssetInfo {
    uuid: string;
    redirect: string;
}

function getRedirectAssets(bundleId: string) {
    const bundle = cc.assetManager.getBundle(bundleId);
    const assets = bundle && (bundle["_config"].assetInfos._map as Record<string, AssetInfo>);

    return Object.values(assets).filter((asset) => asset.redirect);
}

function isAssetExisted(asset: AssetInfo, bundleId?: string) {
    const bundle = cc.assetManager.getBundle(bundleId || asset.redirect);

    return bundle && !!bundle.getAssetInfo(asset.uuid);
}

function getBundleIds(filter = (bundleId: string) => !!bundleId) {
    const allBundles = cc.assetManager.bundles["_map"];

    return Object.keys(allBundles)
        .sort((a, b) => b.localeCompare(a))
        .filter(filter);
}

async function loadRedirectAsset(asset: AssetInfo) {
    const retryBundles = getBundleIds((bundleId) => bundleId !== asset.redirect);

    return new Promise((resolve, reject) => {
        const callback = (error: unknown, result: unknown) => (error || !result ? reject(error) : resolve(result));

        if (isAssetExisted(asset)) {
            cc.assetManager.loadAny(asset.uuid, { bundle: asset.redirect }, callback);
        } else {
            const bundleId = retryBundles.find((bundle) => isAssetExisted(asset, bundle));

            cc.assetManager.loadAny(asset.uuid, { bundle: bundleId }, callback);
        }
    });
}

async function loadAllRedirectAssets(assets: AssetInfo[]) {
    await Promise.all(assets.map(loadRedirectAsset));
}

export async function preloadAssets(bundleId: string) {
    const assets = getRedirectAssets(bundleId);

    try {
        await loadAllRedirectAssets(assets);
    } catch (error) {
        // Skip error because cocos logged all errors while loading assets
    }
}

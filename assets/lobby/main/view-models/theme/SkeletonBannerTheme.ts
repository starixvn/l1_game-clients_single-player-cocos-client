import RemoteSpine, { Type } from "../../../../common/RemoteSpine";
import { IInfoShareResourceBanner } from "../LobbyResourceManager";
import SkeletonBanner from "../SkeletonBanner";
import { themeResourceLoader } from "./ResourceLoader";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkeletonBannerTheme extends SkeletonBanner {
    @property({ type: cc.Node, override: true, visible: false })
    lightTop: cc.Node = null;

    public override async createRemoteIconNode(id: number) {
        try {
            const node = new cc.Node();
            const configFile = this.cache[id] ? this.cache[id].configFile : await themeResourceLoader?.loadRemoteInfoBanner(id);

            if (!configFile) {
                return null;
            }

            this.cache[id] = {
                ...this.cache[id],
                configFile: configFile
            };

            const iconConfig: IInfoShareResourceBanner = configFile?.json;

            node.addComponent(sp.Skeleton);
            const remoteSpine = node.addComponent(RemoteSpine);
            remoteSpine.id = id;
            remoteSpine.spineName = this.spineName;
            remoteSpine.premultipliedAlpha = iconConfig ? iconConfig.premultipliedAlpha : false;
            remoteSpine.type = Type.Banner;
            remoteSpine.useWebp = true;
            await remoteSpine.initLoadSharedResource(this.cache, iconConfig);
            node.active = false;
            return node;
        } catch (error) {
            cc.log("No banner for game " + id);
        }

        return null;
    }

    public override async loadAnimation(id: number) {
        const gameNode = await this.createRemoteIconNode(id);
        if (gameNode) {
            this.hideSkeleton();
            this.gameContent?.childrenCount === 0 && (gameNode.active = true);
            this.gameContent?.addChild(gameNode);
            return true;
        }

        return false;
    }
}

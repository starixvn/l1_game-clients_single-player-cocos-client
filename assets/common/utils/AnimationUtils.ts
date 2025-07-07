export default class AnimationUtils {
    public static fadeIn = (node: cc.Node, duration: number, opacity = 255) => {
        return cc.tween(node).to(duration, { opacity: opacity }).start();
    };

    public static playSpine = (spine: sp.Skeleton, animationName: string, isLoop = false, duration?: number, trackIndex?: number) => {
        return new Promise<void>((resolve, reject) => {
            const animation = spine.findAnimation(animationName);
            if (!animation) {
                resolve();
                return;
            }
            const animationDuration = animation.duration;
            if (duration) {
                spine.timeScale = animationDuration / duration;
            } else {
                duration = animationDuration;
            }

            spine.setAnimation(!!trackIndex ? trackIndex : 0, animationName, isLoop);

            cc.tween(spine)
                .delay(duration)
                .call(() => resolve())
                .start();
        });
    };

    public static playSkinSpine = (
        spine: sp.Skeleton,
        animationName: string,
        skin: string,
        track = 0,
        isLoop = false,
        duration?: number
    ) => {
        return new Promise<void>((resolve, reject) => {
            const animation = spine.findAnimation(animationName);
            if (!animation) {
                resolve();
                return;
            }
            const animationDuration = animation.duration;

            if (duration) {
                spine.timeScale = animationDuration / duration;
            } else {
                duration = animationDuration;
            }

            spine.setAnimation(track, animationName, isLoop);
            if (skin) {
                spine.setSkin(skin);
            }

            cc.tween(spine)
                .delay(duration)
                .call(() => resolve())
                .start();
        });
    };

    public static delayTime = (seconds: number) => {
        return new Promise<void>((resolve) => {
            cc.tween({})
                .delay(seconds)
                .call(() => resolve())
                .start();
        });
    };

    public static pauseSpineAnimation(spineAnimation: sp.Skeleton, startProgress: number, animationName) {
        spineAnimation.node.active = true;
        spineAnimation.timeScale = 0;
        spineAnimation.setAnimation(0, animationName, false);
        const trackEntry = spineAnimation.getCurrent(0);
        trackEntry.animationStart = trackEntry.animationEnd * startProgress;
    }
}
export const isValidNode = (comp: cc.Component) => {
    return comp.node && comp.node.isValid;
};

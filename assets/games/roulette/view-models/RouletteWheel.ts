import * as _ from "lodash";

import AudioManager from "../../../common/audio/AudioManager";
import RouletteResultNumber from "./RouletteResultNumber";

const { ccclass, property } = cc._decorator;
enum WheelAnimation {
    WHEEL_IDLE = "Wheel Idle",
    WHEEL_IN = "Wheel In",
    WHEEL_LOOP_TRANSITION = "Wheel Loop Transition",
    WHEEL_LOOP = "Wheel Loop",
    BALL_IDLE = "Ball Idle",
    BALL_IN = "Ball In",
    BALL_LOOP_TRANSITION = "Ball Loop Transition",
    BALL_LOOP = "Ball Loop",
    BALL_HIT_OUT_LOWER = "Ball Hit Out ",
    BALL_NO_HIT_OUT = "Ball No Hit Out ",
    BALL_HIT_OUT_UPPER = "Ball Hit Out Upper ",
    WHEEL_HIT_OUT_NAME = "Wheel Hit Out ",
    BALL_STOP_TARGET_SECTOR_1_FORWARD = "Ball Stop c ",
    BALL_STOP_TARGET_SECTOR_2_FORWARD = "Ball Stop e ",
    BALL_STOP_TARGET_SECTOR_0_1 = "Ball Stop d ",
    BALL_STOP_TARGET_SECTOR_0_2 = "Ball Stop No Hit ",
    BALL_SKIP = "Ball Skip",
    WHEEL_STOP_TRANSITION = "Wheel Stop Transition",
    BALL_POST_COLLISION_TRANSITION_LOWER_FORWARD = "Ball Post Collision Transition ",
    BALL_POST_COLLISION_TRANSITION_UPPER_FORWARD = "Ball-Post-Collission-Transition-Upper-Forward-",
    BALL_POST_COLLISION_TRANSITION_LOWER_BACKWARD = "Ball-Post-Collission-Transition-Backward "
}

enum WheelAudio {
    BALL_ROLLING = 0,
    BALL_JUMPING_NORMAL,
    BALL_JUMPING_HIT,
    RESULT_ANNOUNCE,
    RESULT_HIGHLIGHT
}

@ccclass
export default class RouletteWheel extends cc.Component {
    @property(sp.Skeleton)
    animation: sp.Skeleton = null;

    @property({ type: cc.AudioSource })
    audios: cc.AudioSource[] = [];

    @property(RouletteResultNumber)
    resultNumber: RouletteResultNumber = null;

    @property
    durationShowResult = 0;

    wheelTrack = 0;
    ballTrack = 1;
    timeScale = 0;
    initBallRotation = 0;

    rotateBallBone: any;
    isFromRestore = false;
    resultReceived = false;
    sectorsNumber: number;
    sectorStartAngle: number;
    sectorInitialAngle: number;
    numberRotationDegree: number;
    numberLocalIndex: number;
    startAngleDegrees: number;
    wheelNumbersIndices: number[];
    wheelNumbersRotations: number[] = [];
    currentNumberColorVO: any;
    numbersColorsVOs: any[] = [];
    landingAnimationGroups: any[] = [];
    landingAnimationGroup: any;

    fullRotationDegrees = 360;
    MIN_DEGREE = 0;
    MAX_DEGREE = 180;
    WHEEL_DEGREE_STEP = 45;
    BALL_HIT_OUT_DEGREE_STEP = 45;

    onLoad() {
        this.initWheel();
        this.resultNumber.hide();
    }

    playSound(soundId: number, loop = false) {
        if (!AudioManager.getInstance().sfxEnabled || soundId > this.audios.length - 1 || soundId < 0) {
            return;
        }
        this.audios[soundId].loop = loop;
        AudioManager.getInstance().playSFX(this.audios[soundId].clip);
    }

    stopSound(soundId: number) {
        this.audios[soundId].stop();
    }

    showResultNumber(result: number) {
        this.resultNumber.setNumber(result);
        this.resultNumber.show();

        const node = this.resultNumber.node;
        node.scale = 0;

        cc.tween(node).to(0.5, { scale: 1 }, { easing: "backOut" }).start();
    }

    hideResultNumber() {
        const node = this.resultNumber.node;
        cc.tween(node)
            .to(0.5, { scale: 0 }, { easing: "backIn" })
            .call(() => this.resultNumber.hide())
            .start();
    }

    showResult(result: number, onComplete: () => void) {
        this.prepareWheelSpinAnimation();
        const t = { resultNumber: result + 1 };
        this.onWheelUpdateResultNumber(t);
        cc.tween(this.node)
            .delay(9)
            .call(() => {
                this.showResultNumber(result);
            })
            .delay(this.durationShowResult)
            .call(onComplete)
            .start();
    }

    setResult(result: number) {
        const lastResult = result;
        this.numberRotationDegree = this.wheelNumbersRotations[lastResult];
        this.startIdleAnimation();
    }

    onSkip() {
        const e = this.getCurrentWheelDegree();
        this.forceBallStopAnimation(e);
    }

    onSpinClick() {
        this.prepareWheelSpinAnimation();
    }

    pauseAnimation() {
        this.animation.timeScale = 0;
    }

    resumeAnimation() {
        this.animation.timeScale = this.timeScale;
    }

    convertTo360(t) {
        return t < 0 ? this.fullRotationDegrees + t : t;
    }

    getCurrentWheelDegree() {
        let t;
        this.pauseAnimation();
        const e = this.animation.getCurrent(this.wheelTrack);
        const i = this.getRotationDataFromTrack(e);
        const n = e.getAnimationTime();
        let o = i.angle - i.frames[1];

        return (
            0 === o && (o += this.fullRotationDegrees),
            (o = this.convertTo360(o)),
            (t = (n / i.frameTime) * o + i.frames[1]) > this.fullRotationDegrees / 2 && (t -= this.fullRotationDegrees),
            this.resumeAnimation(),
            t
        );
    }

    getRotationDataFromTrack(t) {
        const e: any = {};
        if (!_.isNil(t)) {
            const i = t.animation;
            const o = _.filter(i.timelines, (t) => {
                return t instanceof sp.spine.RotateTimeline;
            })[0];
            if (!_.isNil(o)) {
                const r = o.frames.length >> 1;
                const s = t.getAnimationTime();
                const a = sp.spine.Animation.binarySearch(o.frames, s, sp.spine.RotateTimeline.ENTRIES);
                (e.name = i.name),
                    (e.frames = o.frames),
                    (e.frameIndex = a),
                    (e.frameTime = o.frames[a]),
                    (e.angle = o.frames[a + 1]),
                    (e.size = r);
            }
        }
        return e;
    }

    getRotationDataFromAnimation(t) {
        const e: any = {},
            i = this.getAnimationRotationTimeline(t);
        const o = i.frames.length >> 1,
            s = sp.spine.Animation.binarySearch(i.frames, 0, sp.spine.RotateTimeline.ENTRIES);
        (e.name = t), (e.frames = i.frames), (e.frameIndex = s), (e.frameTime = i.frames[s]), (e.angle = i.frames[s + 1]), (e.size = o);
        return e;
    }

    getAnimationRotationTimeline(t) {
        const i = this.getAnimation(t);
        return _.filter(i.timelines, (t) => {
            return t instanceof sp.spine.RotateTimeline;
        })[0];
    }

    getAnimation(t) {
        return this.animation.findAnimation(t);
    }

    updateRotationTimeline(t, e) {
        const i = this.getAnimationRotationTimeline(t);
        _.each(e, (t, e) => {
            const n = e << 1;
            i.frames[n + 1] = t;
        });
    }

    adjustAnimationRotationTimeline(t, e) {
        const i = this.getRotationDataFromAnimation(t);
        if (_.has(i, "size")) {
            const o = this.getRotationFrameSteps(i.frames, i.size),
                r = this.getWheelDegreesArray(e, i.size, o);
            this.updateRotationTimeline(t, r);
        }
    }

    getWheelDegreesArray(t, e, i) {
        let o = this,
            r = new Array(e),
            s = t;
        return (
            _.fill(r, 0),
            _.each(_.range(e), (t) => {
                (r[t] = s), (s = o.getNextWheelDegreeValue(s, i[t]));
            }),
            r
        );
    }

    getRotationFrameSteps(t, e) {
        let i,
            o = [],
            r = _.filter(t, (t, e) => {
                return e % 2 != 0;
            });
        return (
            _.times(e - 1, (t) => {
                (i = r[t + 1] - r[t]) < 0 && (i += 360), o.push(i);
            }),
            o
        );
    }

    getNextWheelDegreeValue(e, i) {
        let n = NaN;
        if (e + i >= this.MAX_DEGREE) {
            const o = e + i - this.MAX_DEGREE;
            n = o > 0 ? -1 * (this.MAX_DEGREE - o) : this.MAX_DEGREE;
        } else {
            n = e + i;
        }

        return n;
    }

    getHitAnimationId(t) {
        let e = this.convertTo360(t),
            i = this.numberRotationDegree - e;
        return (i = this.convertTo360(i)), Math.ceil(i / this.BALL_HIT_OUT_DEGREE_STEP);
    }

    setWheelContactZone(t, e) {
        return (
            (t += e) <= 0 && (t += this.sectorsNumber),
            1 == t || 3 == t || Math.round(_.random(true)) ? (t += this.sectorsNumber) : (t += 0),
            t
        );
    }

    prepareBallHitAnimation(t, e) {
        let i,
            n,
            o,
            r = this.getHitAnimationId(t);
        if (
            ((o =
                (r = this.setWheelContactZone(r, this.landingAnimationGroup.hitAnimationOffset)) % 2
                    ? Math.ceil(r / 2) - 1
                    : Math.ceil(r / 2)),
            (n = this.landingAnimationGroup.hitAnimation + o),
            (i = WheelAnimation.WHEEL_HIT_OUT_NAME + Math.ceil(r / 2)),
            this.animation.findAnimation(i))
        ) {
            this.adjustAnimationRotationTimeline(i, t);
            const s = this.animation.setAnimation(this.wheelTrack, i, !1),
                a = this.animation.setAnimation(this.ballTrack, n, !1);
            (a.timeScale = (a.animation.duration / s.animation.duration) * s.timeScale), (e.animationId = o), (e.ballTrackEntry = a);
        }
    }

    runBallHitNonCollisionAnimationGroup1(t) {
        const i: any = {};
        this.prepareBallHitAnimation(t, i);
        _.isNil(i.ballTrackEntry) ||
            (i.ballTrackEntry.listener = {
                complete: (t) => {
                    t.animation.name;
                    this.pauseAnimation();
                    const n = this.getCurrentWheelDegree();
                    this.setBallStopAnimDataSector0(n, i.animationId);
                    this.animation._state.setEmptyAnimation(this.ballTrack, 0);
                    this.resumeAnimation();
                    this.stopBallAnimation(n);
                }
            });
    }

    runBallHitCollisionAnimationGroup1(t) {
        const i: any = {};
        (this.prepareBallHitAnimation(t, i), _.isNil(i.ballTrackEntry)) ||
            (i.ballTrackEntry.listener = {
                complete: (t) => {
                    this.pauseAnimation();
                    const n = this.getCurrentWheelDegree();
                    this.animation._state.setEmptyAnimation(this.ballTrack, 0),
                        this.startBallPostCollisionTransitionAnimationGroup1(n, i.animationId),
                        this.resumeAnimation();
                }
            });
    }

    runBallHitCollisionAnimationGroup2(t) {
        const e = this,
            i: any = {};
        (this.prepareBallHitAnimation(t, i), _.isNil(i.ballTrackEntry)) ||
            (i.ballTrackEntry.listener = {
                complete: (t) => {
                    e.pauseAnimation();
                    const n = e.getCurrentWheelDegree();
                    e.animation._state.setEmptyAnimation(e.ballTrack, 0),
                        e.startBallPostCollisionTransitionAnimationGroup2(n, i.animationId),
                        e.resumeAnimation();
                }
            });
    }

    runBallHitCollisionAnimationGroup3(t) {
        const e = this,
            i: any = {};
        (this.prepareBallHitAnimation(t, i), _.isNil(i.ballTrackEntry)) ||
            (i.ballTrackEntry.listener = {
                complete: (t) => {
                    e.pauseAnimation();
                    const n = e.getCurrentWheelDegree();
                    e.animation._state.setEmptyAnimation(e.ballTrack, 0),
                        e.startBallPostCollisionTransitionAnimationGroup3(n, i.animationId),
                        e.resumeAnimation();
                }
            });
    }

    startBallPostCollisionTransitionAnimationGroup1(t, e) {
        const n: any = {};
        this.prepareBallPostCollisionTransitionAnimation(t, e, n),
            _.isNil(n.ballTrackEntry) ||
                (n.ballTrackEntry.listener.complete = (t) => {
                    this.pauseAnimation();
                    const n = this.getCurrentWheelDegree();
                    this.animation._state.setEmptyAnimation(this.ballTrack, 0),
                        this.setBallStopAnimDataSector1Forward(n, e),
                        this.resumeAnimation(),
                        this.stopBallAnimation(n);
                });
    }

    startBallPostCollisionTransitionAnimationGroup2(t, e) {
        const n: any = {};
        this.prepareBallPostCollisionTransitionAnimation(t, e, n),
            _.isNil(n.ballTrackEntry) ||
                (n.ballTrackEntry.listener.complete = (t) => {
                    this.pauseAnimation();
                    const n = this.getCurrentWheelDegree();
                    this.animation._state.setEmptyAnimation(this.ballTrack, 0),
                        this.setBallStopAnimDataSector0(n, e),
                        this.resumeAnimation(),
                        this.stopBallAnimation(n);
                });
    }

    startBallPostCollisionTransitionAnimationGroup3(t, e) {
        const n: any = {};
        this.prepareBallPostCollisionTransitionAnimation(t, e, n),
            _.isNil(n.ballTrackEntry) ||
                (n.ballTrackEntry.listener.complete = (t) => {
                    this.pauseAnimation();
                    const n = this.getCurrentWheelDegree();
                    this.animation._state.setEmptyAnimation(this.ballTrack, 0),
                        this.setBallStopAnimDataSector2Forward(n, e),
                        this.resumeAnimation(),
                        this.stopBallAnimation(n);
                });
    }

    prepareBallPostCollisionTransitionAnimation(t, e, i) {
        const o = WheelAnimation.WHEEL_HIT_OUT_NAME + this.landingAnimationGroup.transitionAnimationOffset;
        _.isNaN(t) || this.adjustAnimationRotationTimeline(o, t), this.animation._state.setAnimation(this.wheelTrack, o, !1);
        const s = this.landingAnimationGroup.transitionAnimation + e,
            a = this.animation._state.addAnimation(this.ballTrack, s, !1, 0);
        (i.ballTrackEntry = a),
            (a.listener = {
                start: (t) => {
                    this.playSound(WheelAudio.BALL_JUMPING_HIT);
                }
            });
    }

    initWheel() {
        this.timeScale = this.animation.timeScale;
        this.landingAnimationGroups = [
            {
                hitAnimation: WheelAnimation.BALL_NO_HIT_OUT,
                transitionAnimation: null,
                stopAnimation: WheelAnimation.BALL_STOP_TARGET_SECTOR_0_2,
                hitAnimationOffset: 0,
                transitionAnimationOffset: NaN
            },
            {
                hitAnimation: WheelAnimation.BALL_HIT_OUT_LOWER,
                transitionAnimation: WheelAnimation.BALL_POST_COLLISION_TRANSITION_LOWER_FORWARD,
                stopAnimation: WheelAnimation.BALL_STOP_TARGET_SECTOR_1_FORWARD,
                hitAnimationOffset: -4,
                transitionAnimationOffset: 2
            },
            {
                hitAnimation: WheelAnimation.BALL_HIT_OUT_LOWER,
                transitionAnimation: WheelAnimation.BALL_POST_COLLISION_TRANSITION_LOWER_BACKWARD,
                stopAnimation: WheelAnimation.BALL_STOP_TARGET_SECTOR_0_1,
                hitAnimationOffset: -2,
                transitionAnimationOffset: 2
            },
            {
                hitAnimation: WheelAnimation.BALL_HIT_OUT_UPPER,
                transitionAnimation: WheelAnimation.BALL_POST_COLLISION_TRANSITION_UPPER_FORWARD,
                stopAnimation: WheelAnimation.BALL_STOP_TARGET_SECTOR_2_FORWARD,
                hitAnimationOffset: -4,
                transitionAnimationOffset: 1
            }
        ];
        this.wheelNumbersIndices = [
            0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12,
            35, 3, 26
        ];
        this.numbersColorsVOs = [
            { id: -1, value: " ", color: "empty" },
            { id: 0, value: "0", color: "green" },
            { id: 1, value: "00", color: "green" },
            { id: 2, value: "1", color: "red" },
            { id: 3, value: "2", color: "black" },
            { id: 4, value: "3", color: "red" },
            { id: 5, value: "4", color: "black" },
            { id: 6, value: "5", color: "red" },
            { id: 7, value: "6", color: "black" },
            { id: 8, value: "7", color: "red" },
            { id: 9, value: "8", color: "black" },
            { id: 10, value: "9", color: "red" },
            { id: 11, value: "10", color: "black" },
            { id: 12, value: "11", color: "black" },
            { id: 13, value: "12", color: "red" },
            { id: 14, value: "13", color: "black" },
            { id: 15, value: "14", color: "red" },
            { id: 16, value: "15", color: "black" },
            { id: 17, value: "16", color: "red" },
            { id: 18, value: "17", color: "black" },
            { id: 19, value: "18", color: "red" },
            { id: 20, value: "19", color: "red" },
            { id: 21, value: "20", color: "black" },
            { id: 22, value: "21", color: "red" },
            { id: 23, value: "22", color: "black" },
            { id: 24, value: "23", color: "red" },
            { id: 25, value: "24", color: "black" },
            { id: 26, value: "25", color: "red" },
            { id: 27, value: "26", color: "black" },
            { id: 28, value: "27", color: "red" },
            { id: 29, value: "28", color: "black" },
            { id: 30, value: "29", color: "black" },
            { id: 31, value: "30", color: "red" },
            { id: 32, value: "31", color: "black" },
            { id: 33, value: "32", color: "red" },
            { id: 34, value: "33", color: "black" },
            { id: 35, value: "34", color: "red" },
            { id: 36, value: "35", color: "black" },
            { id: 37, value: "36", color: "red" }
        ];

        this.startAngleDegrees = this.fullRotationDegrees / this.wheelNumbersIndices.length;
        _.each(this.wheelNumbersIndices, (t, e) => {
            this.wheelNumbersRotations[t] = this.startAngleDegrees * (e + 1);
        });
        this.sectorsNumber = this.fullRotationDegrees / this.WHEEL_DEGREE_STEP;
        this.initWheelSpineAnimation();
    }

    initWheelSpineAnimation() {
        this.rotateBallBone = this.animation.findBone("Rotate Ball");
        this.animation.setToSetupPose();
        this.animation.setStartListener((e) => {
            e.animation.name == WheelAnimation.BALL_LOOP && this.playSound(WheelAudio.BALL_ROLLING, !0);
        });
        this.animation.setEventListener((e, i) => {
            "Animation-Progress" == i.data.name && this.applyStopAnimationRotationStep();
            "start_wheel" == i.data.name && _.has(i.data, "stringValue") && this.playSound(i.data.stringValue, !1);
        });
        // this.playSoundCallBack = this.playSound.bind(this),
        // this.stopSoundCallBack = this.stopSound.bind(this),
        // this.onSkipEvenHandler = this.onSpineSkipEvent.bind(this),
        // this.onApplyStopAnimationRotationStep = this.applyStopAnimationRotationStep.bind(this),
        // this.addSpine()),
        // this.wheelResultController.hide(),
    }

    applyStopAnimationRotationStep() {
        const t = (this.sectorInitialAngle - this.sectorStartAngle) / 3;
        this.rotateBallBone.rotation += t;
    }

    onWheelPositionBallOnNumber(t) {
        this.isFromRestore = t.isFromRestore;
        const i = t.lastNumber;
        if (i > -1) {
            const n = this.getWheelNumber(i);
            this.numberRotationDegree = this.wheelNumbersRotations[n];
        } else {
            this.numberRotationDegree = this.initBallRotation;
        }

        let o = !1;
        _.has(t, "showWheel") && (o = t.showWheel),
            o &&
                this.resetWheelAnimation().then(() => {
                    this.startIdleAnimation();
                    this.onWheelShow();
                });
    }

    startIdleAnimation() {
        const t = this.animation.getCurrent(this.wheelTrack);
        if (!_.isNil(t)) {
            const e = this.getCurrentWheelDegree();
            this.adjustAnimationRotationTimeline(WheelAnimation.WHEEL_IDLE, e);
            // this.pauseAnimation();
        }
        this.animation.setAnimation(this.wheelTrack, WheelAnimation.WHEEL_IDLE, !0),
            this.animation.setAnimation(this.ballTrack, WheelAnimation.BALL_IDLE, !0),
            (this.rotateBallBone.rotation = -this.numberRotationDegree),
            this.isFromRestore && (this.isFromRestore = !1);
    }

    onWheelShow() {}

    setBallStopAnimDataSector0(t, e) {
        const i = Math.ceil(this.numberRotationDegree / this.BALL_HIT_OUT_DEGREE_STEP);
        this.sectorStartAngle = this.numberRotationDegree;
        this.numberLocalIndex = 1;
        let n = this.convertTo360(t),
            o = e * this.BALL_HIT_OUT_DEGREE_STEP - (this.fullRotationDegrees - n);
        for (
            o < 0 && (o += this.fullRotationDegrees),
                o < this.BALL_HIT_OUT_DEGREE_STEP && 8 == i && (o += this.fullRotationDegrees),
                this.sectorInitialAngle = o;
            this.sectorStartAngle + this.startAngleDegrees < o;

        ) {
            this.sectorStartAngle += this.startAngleDegrees;
            this.numberLocalIndex++;
        }
    }

    setBallStopAnimDataSector1Forward(t, e) {
        const i = Math.ceil(this.numberRotationDegree / this.BALL_HIT_OUT_DEGREE_STEP);
        (this.sectorStartAngle = this.numberRotationDegree), (this.numberLocalIndex = 1);
        let n = this.convertTo360(t),
            o = (e + 1) * this.BALL_HIT_OUT_DEGREE_STEP - (this.fullRotationDegrees - n);
        for (
            o < 0 && (o += this.fullRotationDegrees),
                o > this.fullRotationDegrees - this.BALL_HIT_OUT_DEGREE_STEP && 1 == i && (o -= this.fullRotationDegrees),
                this.sectorInitialAngle = o;
            this.sectorStartAngle - this.startAngleDegrees >= o;

        ) {
            this.sectorStartAngle -= this.startAngleDegrees;
            this.numberLocalIndex++;
        }
    }

    setBallStopAnimDataSector2Forward(t, e) {
        const i = Math.ceil(this.numberRotationDegree / this.BALL_HIT_OUT_DEGREE_STEP);
        (this.sectorStartAngle = this.numberRotationDegree - this.BALL_HIT_OUT_DEGREE_STEP),
            (this.sectorStartAngle = this.convertTo360(this.sectorStartAngle)),
            (this.numberLocalIndex = 1);
        let n = this.convertTo360(t),
            o = (e + 1) * this.BALL_HIT_OUT_DEGREE_STEP - (this.fullRotationDegrees - n);
        for (
            o < 0 && (o += this.fullRotationDegrees),
                o > this.fullRotationDegrees - this.BALL_HIT_OUT_DEGREE_STEP && 2 == i && (o -= this.fullRotationDegrees),
                this.sectorInitialAngle = o;
            this.sectorStartAngle - this.startAngleDegrees >= o;

        ) {
            this.sectorStartAngle -= this.startAngleDegrees;
            this.numberLocalIndex++;
        }
    }

    onWheelUpdateResultNumber(t) {
        const e = t.resultNumber;
        if (-1 != e) {
            const i = this.getWheelNumber(e);
            (this.numberRotationDegree = this.wheelNumbersRotations[i]),
                (this.resultReceived = !0),
                (this.currentNumberColorVO = this.getNumberColorVO(e));
            const n = {
                value: this.currentNumberColorVO.value,
                color: this.currentNumberColorVO.color
            };
            // this.wheelResultController.updateResult(n);
            const o = this.animation.getCurrent(this.wheelTrack).animation.name;
        }
    }

    getWheelNumber(t) {
        const e = this.getNumberColorVO(t);
        return Number(e.value);
    }

    getNumberColorVO(t) {
        let e = void 0;
        return (
            _.each(this.numbersColorsVOs, (i, n) => {
                if (i.id == t) {
                    e = i;
                    return !1;
                }
            }),
            e
        );
    }

    resetWheelAnimation() {
        return new Promise((res, rej) => {
            this.rotateBallBone.setToSetupPose();
            res();
        });
    }

    stopBallAnimation(t) {
        this.adjustAnimationRotationTimeline(WheelAnimation.WHEEL_STOP_TRANSITION, t);
        const i = this.animation.setAnimation(this.wheelTrack, WheelAnimation.WHEEL_STOP_TRANSITION, !1),
            n = this.landingAnimationGroup.stopAnimation + this.numberLocalIndex;
        this.animation.setAnimation(this.ballTrack, n, !1).listener = {
            start: (t) => {
                this.stopSound(WheelAudio.BALL_ROLLING);
                this.landingAnimationGroup.stopAnimation == WheelAnimation.BALL_STOP_TARGET_SECTOR_0_2 &&
                    this.playSound(WheelAudio.BALL_JUMPING_NORMAL),
                    (this.rotateBallBone.rotation = -this.sectorInitialAngle);
            },
            complete: (t) => {
                this.resultReceived = !1;
                //     this.hasToSkipAnimation = this.isTurboActive,
                //     this.wheelResultController.show(),
                //     this.broadcastAction(d.RWheelDecoratorBroadcastActionNames.WHEEL_RESULT_APPEARED, {
                //         numberColorVO: this.currentNumberColorVO,
                //         callback: this.announceWheelComplete.bind(this)
                //     })
            }
        };
        i.listener = {
            complete: (t) => {
                this.pauseAnimation();
                const i = this.getCurrentWheelDegree();
                this.adjustAnimationRotationTimeline(WheelAnimation.WHEEL_IDLE, i);
                this.animation.setAnimation(this.wheelTrack, WheelAnimation.WHEEL_IDLE, !0);
                this.resumeAnimation();
            }
        };
    }

    forceBallStopAnimation(t) {
        _.isNaN(t) || this.adjustAnimationRotationTimeline(WheelAnimation.WHEEL_IDLE, t),
            this.animation._state.setAnimation(this.wheelTrack, WheelAnimation.WHEEL_IDLE, !0),
            this.animation._state.setEmptyAnimation(this.ballTrack, 0),
            (this.animation._state.addAnimation(this.ballTrack, WheelAnimation.BALL_SKIP, !1, 0).listener = {
                start: (t) => {
                    this.stopSound(WheelAudio.BALL_ROLLING);
                    this.rotateBallBone.rotation = -this.numberRotationDegree;
                    this.resultReceived = !1;
                }
            });
    }

    onWheelStartSpinAnimation(t) {
        let i = !1;
        if ((_.has(t, "showWheel") && (i = t.showWheel), i)) {
            this.isFromRestore && this.rotateBallBone.setToSetupPose();
            const n = this.animation.getCurrent(this.wheelTrack);
            (_.isNil(n) || n.animation.name !== WheelAnimation.WHEEL_IDLE) && (this.pauseAnimation(), this.startIdleAnimation()),
                this.resumeAnimation(),
                _.delay(() => {
                    return this.onWheelShow();
                }, 0);
        } else {
            this.prepareWheelSpinAnimation();
        }
    }

    prepareWheelSpinAnimation() {
        let e = NaN,
            i = this.animation.getCurrent(this.wheelTrack);
        this.pauseAnimation();
        e = this.getCurrentWheelDegree();

        this.resetWheelAnimation().then(() => {
            _.isNaN(e) ||
                (this.adjustAnimationRotationTimeline(WheelAnimation.WHEEL_LOOP, e), this.resumeAnimation(), this.startBallAnimation());
        });
    }

    startBallAnimation() {
        this.animation.setAnimation(this.wheelTrack, WheelAnimation.WHEEL_LOOP, true);
        const count = 0;
        const trackEntry = this.animation.setAnimation(this.ballTrack, WheelAnimation.BALL_LOOP, true);
        const tmpThis = this;
        trackEntry.listener = {
            complete: () => {
                tmpThis.resultReceived && this.startBallTransitionAnimation();
            }
        };
    }

    startBallTransitionAnimation() {
        this.animation.setAnimation(this.ballTrack, WheelAnimation.BALL_LOOP_TRANSITION, false).listener = {
            complete: () => {
                this.pauseAnimation();
                const i = this.getCurrentWheelDegree();
                this.resumeAnimation();
                this.startBallLanding(i);
            }
        };
    }

    startBallLanding(t) {
        const landingType = _.random(0, 3);
        this.landingAnimationGroup = this.landingAnimationGroups[landingType];
        switch (landingType) {
            case 0:
                this.runBallHitNonCollisionAnimationGroup1(t);
                break;
            case 1:
                this.runBallHitCollisionAnimationGroup1(t);
                break;
            case 2:
                this.runBallHitCollisionAnimationGroup2(t);
                break;
            case 3:
                this.runBallHitCollisionAnimationGroup3(t);
                break;
        }
    }
}

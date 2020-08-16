import { _decorator, Component, Node, AudioClip, AudioSourceComponent, tween, clamp } from 'cc';
const { ccclass, property } = _decorator;

export enum ClipIndex {
    BGM_1,
    BGM_2,
    BGM_3,
    SCATTER,
    GATHER,
    INVALID_OP,
    VALID_OP,
    WIN,
    AD_1,
    AD_2,
    AD_3,
    DEAL,
    OOS,
    COUNT,
}

const intervals = [
    100,  // BGM_1
    100,  // BGM_2
    100,  // BGM_3
    2000, // SCATTER
    2000, // GATHER
    100,  // INVALID_OP
    100,  // VALID_OP
    100,  // WIN
    100,  // AD_1
    100,  // AD_2
    100,  // AD_3
    100,  // DEAL
    100,  // OOS
];

@ccclass('AudioManager')
export class AudioManager extends Component {

    @property([AudioClip])
    clips: AudioClip[] = [];

    _sources: AudioSourceComponent[] = [];
    _curStage = ClipIndex.BGM_1;

    _lastPlayedRecord = Array(ClipIndex.COUNT).fill(0);

    _ended = false;

    public static instance: AudioManager;

    start () {
        this._sources = this.getComponents(AudioSourceComponent);
        this._sources[ClipIndex.BGM_1].clip.on('started', () => {
            tween(this._sources[0]).to(2, { volume: 1 }, { easing: 'bounceInOut' }).start();
        });
        AudioManager.instance = this;
    }

    setBGMStage(percent: number) {
        const index = clamp(Math.floor(percent * 20), ClipIndex.BGM_1, ClipIndex.BGM_3);

        if (this._ended || index === this._curStage) return;

        if (index > this._curStage) {
            for (let i = this._curStage + 1; i <= index; i++) {
                tween(this._sources[i]).to(2, { volume: 1 }, { easing: 'bounceInOut' }).start();
            }
        } else {
            for (let i = this._curStage - 1; i >= index; i++) {
                tween(this._sources[i]).to(2, { volume: 0 }, { easing: 'bounceInOut' }).start();
            }
        }

        this._curStage = index;
    }

    fadeOutAll () {
        this._ended = true;
        for (let i = 0; i <= this._curStage; i++) {
            tween(this._sources[i]).to(2, { volume: 0 }, { easing: 'bounceInOut' }).start();
        }
    }

    playOneShot(index: ClipIndex) {
        const now = performance.now();
        if (now - this._lastPlayedRecord[index] < intervals[index]) return;
        this._sources[0].playOneShot(this.clips[index]);
        this._lastPlayedRecord[index] = performance.now();
    }
}

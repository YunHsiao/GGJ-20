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
}

@ccclass('AudioManager')
export class AudioManager extends Component {

    @property([AudioClip])
    clips: AudioClip[] = [];

    _sources: AudioSourceComponent[] = [];
    _curStage = ClipIndex.BGM_1;

    start () {
        this._sources = this.getComponents(AudioSourceComponent);
        this._sources[ClipIndex.BGM_1].clip.on('started', () => {
            tween(this._sources[0]).to(2, { volume: 1 }, { easing: 'bounceInOut' }).start();
        });
    }

    setBGMStage(percent: number) {
        const index = clamp(Math.floor(percent * 3), ClipIndex.BGM_1, ClipIndex.BGM_3);

        if (index === this._curStage) return;

        if (index > this._curStage) {
            for (let i = this._curStage + 1; i <= index; i++) {
                this._sources[i].play();
                this._sources[i].clip.on('started', () => {
                    tween(this._sources[i]).to(2, { volume: 1 }, { easing: 'bounceInOut' }).start();
                });
            }
        } else {
            for (let i = this._curStage - 1; i >= index; i++) {
                tween(this._sources[i]).to(2, { volume: 1 }, { easing: 'bounceInOut' }).call(() => this._sources[0].stop()).start();
            }
        }

        this._curStage = index;
    }

    playOneShot(index: ClipIndex) {
        this._sources[0].playOneShot(this.clips[index]);
    }
}

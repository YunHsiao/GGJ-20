import { _decorator, Component, Node, AnimationClip, AnimationComponent, error } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimationHelper')
export class AnimationHelper extends Component {

    private static instance: AnimationHelper;

    private constructor () {
        super();
        if (AnimationHelper.instance) error("animation helper can only be one instance.");
        AnimationHelper.instance = this;
    }

    @property([AnimationClip])
    clips: AnimationClip[] = [];

    @property([Node])
    targets: Node[] = [];

    static play (i0 = 0, i1 = 0) {
        const target = this.instance.targets[i0];
        const clip = this.instance.clips[i1];
        let anim = target.getComponent(AnimationComponent);
        if (!anim) {
            anim = target.addComponent(AnimationComponent);
            anim.createState(clip);
        }
        anim.play(clip.name);
    }
}

import { _decorator, Component, Node, SkeletalAnimationComponent, AnimationClip, AnimationComponent, AnimationState, Vec3, Quat, SkinningModelComponent, ModelComponent, Color } from 'cc';
import { ParcelDispenser } from './ParcelDispenser';
const { ccclass, property } = _decorator;

const dir = new Vec3();
const XZ = new Vec3(1, 0, 1);
const rot = new Quat();

@ccclass('CompanySuit')
export class CompanySuit extends Component {

    animComp: SkeletalAnimationComponent;

    _interactFinished = true;
    _targetRotation = new Quat();
    _rotationLerpCountDown = 1;
    _reactionFn: Function;

    start () {
        this.animComp = this.node.getComponent(SkeletalAnimationComponent);
        this.animComp.getState('Root|Interact_standing').wrapMode = AnimationClip.WrapMode.Normal;
        this.animComp.getState('Root|Interact_ground').wrapMode = AnimationClip.WrapMode.Normal;
        this.animComp.on(AnimationComponent.EventType.FINISHED, (type: AnimationComponent.EventType, state: AnimationState) => {
            if (state.name === 'Root|Interact_standing') {
                if (!this._interactFinished) {
                    this.animComp.crossFade('Root|Idle');
                    this._interactFinished = true;
                }
            } else if (state.name === 'Root|Interact_ground') {
                this.getComponentInChildren(SkinningModelComponent).enabled = false;
                this.node.getChildByName('Shadow').getComponent(ModelComponent).material.setProperty('mainColor', Color.BLACK);
                ParcelDispenser.instance.releaseAll();
                this._reactionFn();
            }
        });
    }

    handWaving (position: Vec3) {
        if (this._reactionFn) return;
        this._rotationLerpCountDown = 3;
        Quat.fromViewUp(this._targetRotation, Vec3.normalize(dir, Vec3.multiply(dir, position, XZ)));
        if (this._interactFinished) {
            this.animComp.crossFade('Root|Interact_standing');
            this._interactFinished = false;
        }
    }

    bailOut (cb: Function) {
        this.animComp.crossFade('Root|Interact_ground');
        this._reactionFn = cb;
    }

    update (dt: number) {
        if (this._rotationLerpCountDown > 0) {
            Quat.slerp(rot, this.node.rotation, this._targetRotation, 0.1);
            this.node.setRotation(rot);
            this._rotationLerpCountDown -= dt;
        }
    }
}

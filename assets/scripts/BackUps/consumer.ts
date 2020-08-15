import { _decorator, Component, Node, Vec3, Quat, ModelComponent, SkinningModelComponent, random, randomRange, randomRangeInt, SkeletalAnimationComponent } from 'cc';
const { ccclass, property } = _decorator;

const delta = new Vec3();
const view = new Vec3();
const rot = new Quat();

const textureCounts = [8, 7];

@ccclass('Consumer')
export class Consumer extends Component {

    animComp: SkeletalAnimationComponent = null;
    model: ModelComponent = null;

    chemistry = random();

    velocity = new Vec3();
    targetRotation = new Quat();
    rotationLerpCountDown = 1;
    nextTurn = -1;
    idle = false;
    radius = 0;

    start () {
        this.animComp = this.node.getComponent(SkeletalAnimationComponent);
        this.model = this.node.getComponentInChildren(SkinningModelComponent);
        const tilingOffset = [1 / textureCounts[0], 1 / textureCounts[1]];
        tilingOffset.push(randomRangeInt(0, textureCounts[0]) * tilingOffset[0]);
        tilingOffset.push(randomRangeInt(0, textureCounts[1]) * tilingOffset[1]);
        this.model.setInstancedAttribute('a_tiling_offset', tilingOffset);
        this.radius = this.node.scene.getChildByName('Ground').scale.x * 0.5;

        this.animComp.play(this.animComp.clips[randomRangeInt(0, this.animComp.clips.length)].name);
    }

    /* */
    update (deltaTime: number) {
        this.nextTurn -= deltaTime;
        if (this.nextTurn < 0) {
            this.rotationLerpCountDown = 2.1;
            this.idle = random() > this.chemistry;
            if (this.idle) this.velocity.set(0, 0, 0);
            else this.velocity.set(random() - 0.5, 0, random() - 0.5).normalize();
            // this.animComp.play(this.idle ? 'Root|Idle' : 'Root|Run');
            this.nextTurn = randomRange(0, 3);
        }
        const pos = this.node.position;
        Vec3.add(delta, pos, Vec3.multiplyScalar(delta, this.velocity, deltaTime * 5 * (this.chemistry * 3 + 1)));
        if      (delta.x < -this.radius) this.velocity.x =  Math.abs(this.velocity.x), this.rotationLerpCountDown = 2.1;
        else if (delta.x >  this.radius) this.velocity.x = -Math.abs(this.velocity.x), this.rotationLerpCountDown = 2.1;
        if      (delta.y < -this.radius) this.velocity.y =  Math.abs(this.velocity.y), this.rotationLerpCountDown = 2.1;
        else if (delta.y >  this.radius) this.velocity.y = -Math.abs(this.velocity.y), this.rotationLerpCountDown = 2.1;
        if      (delta.z < -this.radius) this.velocity.z =  Math.abs(this.velocity.z), this.rotationLerpCountDown = 2.1;
        else if (delta.z >  this.radius) this.velocity.z = -Math.abs(this.velocity.z), this.rotationLerpCountDown = 2.1;
        this.node.setPosition(delta);

        if (this.rotationLerpCountDown > 2) Quat.fromViewUp(this.targetRotation, Vec3.normalize(view, this.velocity)), this.rotationLerpCountDown = 2;
        if (this.rotationLerpCountDown > 0) this.node.setRotation(Quat.slerp(rot, this.node.rotation, this.targetRotation, 0.1)), this.rotationLerpCountDown -= deltaTime;
    }
    /* */
}

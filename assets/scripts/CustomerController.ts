import { _decorator, Component, Node, Vec3, ModelComponent, SkinningModelComponent, Quat, SkeletalAnimationComponent, random, randomRangeInt, randomRange, Vec4, Color } from 'cc';
import { Customer } from './Customer';
const { ccclass, property } = _decorator;

const delta = new Vec3();
const view = new Vec3();
const rot = new Quat();

const textureCounts = [8, 7];

const color = new Color();
const colorArray = [0.4, 0.4, 0.4, 1];
const shineColorArray = [1, 1, 1, 1];

@ccclass('CustomerController')
export class CustomerController extends Component {
    public customerData: Customer;
    public onBuyProduction: Function;

    animComp: SkeletalAnimationComponent = null;
    model: ModelComponent = null;

    velocity = new Vec3();
    targetRotation = new Quat();
    isHooked = false;
    rotationLerpCountDown = 1;
    nextTurn = -1;
    idle = false;
    radius = 0;

    start () {
        this.customerData = new Customer();
        this.animComp = this.node.getComponent(SkeletalAnimationComponent);
        this.model = this.node.getComponentInChildren(SkinningModelComponent);
        const tilingOffset = [1 / textureCounts[0], 1 / textureCounts[1]];
        tilingOffset.push(randomRangeInt(0, textureCounts[0]) * tilingOffset[0]);
        tilingOffset.push(randomRangeInt(0, textureCounts[1]) * tilingOffset[1]);
        this.model.setInstancedAttribute('a_tiling_offset', tilingOffset);
        this.model.setInstancedAttribute('a_color_instanced', colorArray);
        this.radius = this.node.scene.getChildByName('Ground').scale.x * 0.5;
    }

   update (deltaTime: number) {
        this.nextTurn -= deltaTime;

        const isHooked = this.customerData.attraction > 50;

        if (isHooked) { // run forrest run go buy it all
            this.velocity.set(this.node.position).normalize().multiplyScalar(-1);
            this.rotationLerpCountDown = 2.1;
        } else if (this.nextTurn < 0) {
            this.rotationLerpCountDown = 2.1;
            this.idle = random() > this.customerData.attraction * 0.01;

            if (this.idle) {
                this.velocity.set(0, 0, 0);
            } else {
                this.velocity.set(random() - 0.5, 0, random() - 0.5).normalize();
            }

            if (this.idle) this.animComp.play('Root|Idle');
            else this.animComp.play(this.customerData.attraction > 20 ? 'Root|Run' : 'Root|Walk');
            this.nextTurn = randomRange(0, 3);
        }

        if (isHooked !== this.isHooked) {
            this.isHooked = isHooked;
            this.model.setInstancedAttribute('a_color_instanced', isHooked ? shineColorArray : colorArray);
            if (isHooked) this.animComp.play(this.customerData.attraction > 20 ? 'Root|Run' : 'Root|Walk');
        }

        const pos = this.node.position;
        Vec3.add(delta, pos, Vec3.multiplyScalar(delta, this.velocity, deltaTime * 5 * (this.customerData.attraction * 0.03 + 1)));
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

    addAttraction(value: number) {
        this.customerData.attraction += value;
    }

    buyProduction() {
        if (this.onBuyProduction) {
            this.onBuyProduction(this);
        }
    }
}

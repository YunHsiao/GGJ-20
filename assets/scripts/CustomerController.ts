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

enum CustomerStates {
    IDLE,
    ROAMING,
    HOOKED,
    DEAL,
}

@ccclass('CustomerController')
export class CustomerController extends Component {
    public customerData: Customer;
    public onBuyProduction: Function;

    animComp: SkeletalAnimationComponent = null;
    model: ModelComponent = null;

    state = CustomerStates.IDLE;

    velocity = new Vec3();
    targetRotation = new Quat();

    targetDealDistance = randomRange(5, 15);
    rotationLerpCountDown = 1;
    nextTurn = -1;

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

        // periodic tick
        if (this.nextTurn < 0 && (this.state === CustomerStates.IDLE || this.state === CustomerStates.ROAMING)) {
            const idle = random() > this.customerData.attraction * 0.01;
            this.state = idle ? CustomerStates.IDLE : CustomerStates.ROAMING;

            switch (this.state) {
            case CustomerStates.IDLE:
                this.velocity.set(0, 0, 0);
                this.animComp.play('Root|Idle');
            case CustomerStates.ROAMING:
                this.velocity.set(random() - 0.5, 0, random() - 0.5).normalize();
                this.animComp.play(this.customerData.attraction > 20 ? 'Root|Run' : 'Root|Walk');
                break;
            }

            this.rotationLerpCountDown = 2.1;
            this.nextTurn = randomRange(0, 3);
        }

        const position = this.node.position;

        // per-frame tick
        switch (this.state) {
        // kinematic states
        case CustomerStates.HOOKED: // run forrest run go buy it all
            const len = position.length();
            this.velocity.set(position).multiplyScalar(-1 / len);
            this.rotationLerpCountDown = 2.1;

            if (len < this.targetDealDistance) {
                this.state = CustomerStates.DEAL;
                this.animComp.play('Root|Interact_ground');
            }

        case CustomerStates.ROAMING:

            Vec3.add(delta, position, Vec3.multiplyScalar(delta, this.velocity, deltaTime * 5 * (this.customerData.attraction * 0.03 + 1)));
            if      (delta.x < -this.radius) this.velocity.x =  Math.abs(this.velocity.x), this.rotationLerpCountDown = 2.1;
            else if (delta.x >  this.radius) this.velocity.x = -Math.abs(this.velocity.x), this.rotationLerpCountDown = 2.1;
            if      (delta.y < -this.radius) this.velocity.y =  Math.abs(this.velocity.y), this.rotationLerpCountDown = 2.1;
            else if (delta.y >  this.radius) this.velocity.y = -Math.abs(this.velocity.y), this.rotationLerpCountDown = 2.1;
            if      (delta.z < -this.radius) this.velocity.z =  Math.abs(this.velocity.z), this.rotationLerpCountDown = 2.1;
            else if (delta.z >  this.radius) this.velocity.z = -Math.abs(this.velocity.z), this.rotationLerpCountDown = 2.1;
            this.node.setPosition(delta);

            if (this.rotationLerpCountDown > 2) { // velocity changed, update the rotation target
                Quat.fromViewUp(this.targetRotation, Vec3.normalize(view, this.velocity));
                this.rotationLerpCountDown = 2;
            }

            if (this.rotationLerpCountDown > 0) { // stop lerping after 2
                this.node.setRotation(Quat.slerp(rot, this.node.rotation, this.targetRotation, 0.1));
                this.rotationLerpCountDown -= deltaTime;
            }

            break;
        // static states
        case CustomerStates.IDLE:
        case CustomerStates.DEAL:
            break;
        }
    }

    addAttraction(value: number) {
        const newValue = this.customerData.attraction + value;
        this.customerData.attraction = newValue;

        switch (this.state) {
        case CustomerStates.IDLE:
        case CustomerStates.ROAMING:
            if (newValue > 50) {
                this.state = CustomerStates.HOOKED;
                this.model.setInstancedAttribute('a_color_instanced', shineColorArray);
                this.animComp.play('Root|Run');
            }
            break;
        case CustomerStates.HOOKED:
            if (newValue <= 50) {
                this.state = CustomerStates.IDLE; // what am I doing here?!
                this.nextTurn = -1;
                this.model.setInstancedAttribute('a_color_instanced', colorArray);
            }
            break;
        case CustomerStates.DEAL:
            break;
        }
    }

    buyProduction() {
        if (this.onBuyProduction) {
            this.onBuyProduction(this);
        }
    }
}

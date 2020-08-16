import { _decorator, Component, Vec3, ModelComponent, SkinningModelComponent, Quat, SkeletalAnimationComponent, random, randomRangeInt, randomRange, Node } from 'cc';
import { Customer } from './Customer';
import { GameManager } from './GameManager';
import { ClipIndex, AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

const delta = new Vec3();
const view = new Vec3();
const rot = new Quat();

export const textureCounts = [8, 7];

const colorArray = [1, 1, 1, 1];

enum CustomerStates {
    IDLE,
    ROAMING,
    HOOKED,
    DEAL,
    BEWILDERED,
}

@ccclass('CustomerController')
export class CustomerController extends Component {
    public customerData: Customer;
    public onBuyProduction: Function;

    animComp: SkeletalAnimationComponent = null;
    moodBillBoard: ModelComponent = null;
    model: ModelComponent = null;

    state = CustomerStates.IDLE;

    velocity = new Vec3();
    targetRotation = new Quat();

    targetDealDistance = randomRange(5, 15);
    rotationLerpCountDown = 1;
    nextTurn = -1;

    radius = 0;

    private _isBlack = false;
    private _curBlackPassedTime = 0;
    private _blackLastTime = 3;
    private _falloffRange = 5;
    private _falloffAttraction = 5;
    private _blackRangeIndicator: Node;

    start () {
        this.customerData = new Customer();
        this.animComp = this.node.getComponent(SkeletalAnimationComponent);
        this.model = this.node.getComponentInChildren(SkinningModelComponent);
        this.moodBillBoard = this.node.getChildByName('mood').getComponent(ModelComponent);
        this.moodBillBoard.setInstancedAttribute('a_tiling_offset', [1, 1, 0, 0]);
        this.moodBillBoard.enabled = false;
        this._blackRangeIndicator = this.node.getChildByName('BlackRangeIndicator');

        const tilingOffset = [1 / textureCounts[0], 1 / textureCounts[1]];
        tilingOffset.push(randomRangeInt(0, textureCounts[0]) * tilingOffset[0]);
        tilingOffset.push(randomRangeInt(0, textureCounts[1]) * tilingOffset[1]);
        this.model.setInstancedAttribute('a_tiling_offset', tilingOffset);
        this.radius = this.node.scene.getChildByName('Ground').scale.x * 0.5;
    }

   update (deltaTime: number) {
        this.nextTurn -= deltaTime;

        // periodic tick
        if (this.nextTurn < 0 && (this.state === CustomerStates.IDLE || this.state === CustomerStates.ROAMING)) {
            const idle = random() > this.customerData.attraction * 0.01;

            if (idle && this.state === CustomerStates.ROAMING) {
                this.velocity.set(0, 0, 0);
                this.animComp.play('Root|Idle');
                this.state = CustomerStates.IDLE;
            } else if (!idle && this.state === CustomerStates.IDLE) {
                this.velocity.set(random() - 0.5, 0, random() - 0.5).normalize();
                this.animComp.play(this.customerData.attraction > 20 ? 'Root|Run' : 'Root|Walk');
                this.state = CustomerStates.ROAMING;
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
                if (this.buyProduction()) { // we got a deal
                    this.state = CustomerStates.DEAL;
                    this.animComp.play('Root|Interact_ground');
                    AudioManager.instance.playOneShot(ClipIndex.DEAL);
                } else { // okay I'm out
                    this.state = CustomerStates.ROAMING;
                    this.velocity.set(position).multiplyScalar(1 / len);
                    this.nextTurn = 2;
                    this.moodBillBoard.enabled = true;
                    setTimeout(() => this.moodBillBoard.enabled = false, this.nextTurn * 1000);
                    AudioManager.instance.playOneShot(ClipIndex.OOS);
                }
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

        // static states
        case CustomerStates.IDLE:

            colorArray[0] = colorArray[1] = colorArray[2] = Math.min(this.customerData.attraction * 0.02, 1);
            this.model.setInstancedAttribute('a_color_instanced', colorArray);

            break;
        case CustomerStates.DEAL:
        case CustomerStates.BEWILDERED:
            break;
        }

        if (this._isBlack) {
            this._curBlackPassedTime += deltaTime;
            if (this._curBlackPassedTime > this._blackLastTime) {
                this._blackRangeIndicator.active = false;
                this._isBlack = false
            } else {
                const deltaAttraction = this._falloffAttraction * deltaTime;
                GameManager.Instance.falloffAllCustomersInRange(
                    deltaAttraction, this, this._falloffAttraction);
            }
        }
    }

    bewildered () {
        this.state = CustomerStates.BEWILDERED;
        this.animComp.play('Root|Idle');
    }

    addAttraction(value: number) {
        const newValue = this.customerData.attraction + value;
        this.customerData.attraction = newValue;

        switch (this.state) {
        case CustomerStates.IDLE:
        case CustomerStates.ROAMING:
            if (newValue > 50) {
                this.state = CustomerStates.HOOKED;
                this.animComp.play('Root|Run');
            }
            break;
        case CustomerStates.HOOKED:
            if (newValue <= 50) {
                this.state = CustomerStates.IDLE; // "what am I doing here?!"
                this.animComp.play('Root|Idle');
            }
            break;
        case CustomerStates.DEAL:
        case CustomerStates.BEWILDERED:
            break;
        }
    }

    repel () {
        switch (this.state) {
            case CustomerStates.IDLE:
                this.animComp.play('Root|Run');
            case CustomerStates.HOOKED:
                this.state = CustomerStates.ROAMING;
            case CustomerStates.ROAMING:
                this.nextTurn = random() * 2;
                this.velocity.set(this.node.position).normalize();
                break;
            case CustomerStates.DEAL:
            case CustomerStates.BEWILDERED:
                break;
            }
    }

    buyProduction(): boolean {

        if (GameManager.Instance.queryProductionCount() <= 0) {
            const base = this.customerData.baseAttraction;
            this.customerData.attraction = this.customerData.baseAttraction = Math.floor(base * 0.8);
            this.checkTurnToBlack();
            return false;
        }

        if (this.onBuyProduction) {
            this.onBuyProduction(this);
        }

        return true;
    }

    checkTurnToBlack() {
        if (!this._isBlack) {
            if (this.customerData.baseAttraction < 30) {
                this._isBlack = true;
                this._falloffRange = randomRangeInt(5, 20);
                this._falloffAttraction = randomRangeInt(5, 10);
                this._blackLastTime = randomRangeInt(2, 10);
                this._blackRangeIndicator.setScale(new Vec3(this._falloffRange, 1, this._falloffRange));
                this._blackRangeIndicator.active = true;
            }
        }
    }
}

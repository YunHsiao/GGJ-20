import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

const delta = new Vec3();

@ccclass('Consumer')
export class Consumer extends Component {

    velocity = new Vec3();

    nextTurn = -1;

    // reference
    radius = 0;

    start () {
        this.radius = this.node.scene.getChildByName('Ground').scale.x * 0.5;
    }

    update (deltaTime: number) {
        this.nextTurn -= deltaTime;
        if (this.nextTurn < 0) {
            this.velocity.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize().multiplyScalar(Math.random());
            this.nextTurn = Math.random() * 10;
        }
        const pos = this.node.position;
        Vec3.add(delta, pos, Vec3.multiplyScalar(delta, this.velocity, deltaTime * 5));
        if (delta.x < -this.radius || delta.x > this.radius) this.velocity.x = -this.velocity.x;
        if (delta.y < -this.radius || delta.y > this.radius) this.velocity.y = -this.velocity.y;
        if (delta.z < -this.radius || delta.z > this.radius) this.velocity.z = -this.velocity.z;
        this.node.setPosition(delta);
    }
}

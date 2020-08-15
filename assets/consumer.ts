import { _decorator, Component, Node, Vec3, Quat, ModelComponent, SkinningModelComponent } from 'cc';
const { ccclass, property } = _decorator;

const delta = new Vec3();
const view = new Vec3();
const rot = new Quat();

const textureCounts = [2, 4];

@ccclass('Consumer')
export class Consumer extends Component {

    velocity = new Vec3();

    nextTurn = -1;

    // reference
    radius = 0;

    model: ModelComponent = null;

    start () {
        this.radius = this.node.scene.getChildByName('Ground').scale.x * 0.5;
        this.model = this.node.getComponentInChildren(SkinningModelComponent);
        const tilingOffset = [1 / textureCounts[0], 1 / textureCounts[1]];
        tilingOffset.push(Math.floor(Math.random() * textureCounts[0]) * tilingOffset[0]);
        tilingOffset.push(Math.floor(Math.random() * textureCounts[1]) * tilingOffset[1]);
        this.model.setInstancedAttribute('a_tiling_offset', tilingOffset);
    }

    update (deltaTime: number) {
        this.nextTurn -= deltaTime;
        let needRotationUpdate = false;
        if (this.nextTurn < 0) {
            needRotationUpdate = true;
            this.velocity.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize().multiplyScalar(Math.random());
            this.nextTurn = Math.random() * 10;
        }
        const pos = this.node.position;
        Vec3.add(delta, pos, Vec3.multiplyScalar(delta, this.velocity, deltaTime * 5));
        if (delta.x < -this.radius) this.velocity.x = Math.abs(this.velocity.x), needRotationUpdate = true;
        if (delta.y < -this.radius) this.velocity.y = Math.abs(this.velocity.y), needRotationUpdate = true;
        if (delta.z < -this.radius) this.velocity.z = Math.abs(this.velocity.z), needRotationUpdate = true;
        if (delta.x > this.radius) this.velocity.x = -Math.abs(this.velocity.x), needRotationUpdate = true;
        if (delta.y > this.radius) this.velocity.y = -Math.abs(this.velocity.y), needRotationUpdate = true;
        if (delta.z > this.radius) this.velocity.z = -Math.abs(this.velocity.z), needRotationUpdate = true;
        this.node.setPosition(delta);

        if (needRotationUpdate) this._updateRotation();
    }

    _updateRotation () {
        this.node.setRotation(Quat.fromViewUp(rot, Vec3.normalize(view, this.velocity)));
    }
}

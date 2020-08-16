import { _decorator, Component, Node, Prefab, instantiate, RigidBodyComponent, Vec3, random } from 'cc';
const { ccclass, property } = _decorator;

const force = new Vec3(0, 2000, 0);

@ccclass('ParcelDispenser')
export class ParcelDispenser extends Component {

    @property(Prefab)
    prefab: Prefab = null;

    target = 200;

    _count = 0;

    _end = false;

    public static instance: ParcelDispenser;

    start () {
        ParcelDispenser.instance = this;
    }

    dispense (f: number = 1) {
        const node = instantiate(this.prefab);
        node.setPosition(random(), 1, random());
        node.setScale(random() * 250, 100, random() * 250);
        node.parent = this.node;
        force.y = f * 2000;
        node.getComponent(RigidBodyComponent).applyForce(force);
    }

    releaseAll () {
        this._end = true;
    }

    update () {
        if (this._end && this._count < this.target * 5) {
            if (this._count % 5 === 0) this.dispense();
            this._count++;
        }
    }
}

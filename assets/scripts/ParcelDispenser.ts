import { _decorator, Component, Node, Prefab, instantiate, RigidBodyComponent, Vec3, random } from 'cc';
const { ccclass, property } = _decorator;

const force = new Vec3(0, 2000, 0);

@ccclass('ParcelDispenser')
export class ParcelDispenser extends Component {

    @property(Prefab)
    prefab: Prefab = null;

    target = 200;

    _count = 0;

    update () {
        if (this._count < this.target * 5) {
            if (this._count % 5 === 0) {
                const node = instantiate(this.prefab);
                node.setPosition(random(), 1, random());
                node.setScale(random() * 250, 100, random() * 250);
                node.parent = this.node;
                node.getComponent(RigidBodyComponent).applyForce(force);
            }
            this._count++;
        }
    }
}

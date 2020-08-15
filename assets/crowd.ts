import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Crowd')
export class Crowd extends Component {

    @property
    count = 10;

    @property(Prefab)
    prefab: Prefab = null;

    // reference
    radius = 0;

    start () {
        this.radius = this.node.scene.getChildByName('Ground').scale.x * 0.5;
        this._initGroup();
    }

    private _initGroup () {
        for (let i = 0; i < this.count; i++) {
            const inst = instantiate(this.prefab) as Node;
            inst.setPosition((Math.random() - 0.5) * 2 * this.radius, 0, (Math.random() - 0.5) * 2 * this.radius);
            inst.parent = this.node;
        }
    }
}

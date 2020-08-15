import { _decorator, Component, Node, Prefab, instantiate, Vec3, randomRange } from 'cc';
import { CustomerController } from './CustomerController';
import { PlayerController } from './PlayerController';
import { AdvertisementController } from './AdvertisementController';
import { gameDefines } from './GameDefines';
const { ccclass, property } = _decorator;

const tempVec3 = new Vec3();

@ccclass('GameManager')
export class GameManager extends Component {
    @property({type: PlayerController})
    public playerCtrl: PlayerController = null;
    @property({type: Prefab})
    public customerPrfb: Prefab = null;
    @property
    customerCount = 10;

    private _customers: CustomerController[] = [];
    private _groundNode: Node;
    private _falloffInterval: number = 1;
    private _curFalloffTime: number = 0;

    start () {
        this._groundNode = this.node.scene.getChildByName('Ground');
        this.playerCtrl.onDropAd = this.onDropAd.bind(this);
        // Your initialization goes here.
        this.initCustomers();
    }

    initCustomers() {
        let radius = this._groundNode.scale.x * 0.5;
        for (let i = 0; i < this.customerCount; i++) {
            const inst = instantiate(this.customerPrfb) as Node;
            inst.setPosition(randomRange(-radius, radius), 0, randomRange(-radius, radius));
            inst.parent = this.node;
            this._customers.push(inst.getComponent(CustomerController));
        }
    }

    onDropAd(hitPos: Vec3, ad: AdvertisementController) {
        this._customers.forEach((customer) => {
            Vec3.subtract(tempVec3, hitPos, customer.node.getWorldPosition());
            const dist = tempVec3.length();
            if (dist <= ad.advertisementData.range) {
                customer.addAttraction(ad.advertisementData.attraction);
            }
        });
    }

    falloffAllCustomers(attraction: number) {
        this._customers.forEach((customer) => {
            customer.addAttraction(attraction);
        });
    }

    update (deltaTime: number) {
        // Your update function goes here.
        this._curFalloffTime += deltaTime;
        if (this._curFalloffTime > this._falloffInterval) {
            this.falloffAllCustomers(-gameDefines.fallofSpeed);
            this._curFalloffTime = 0;
        }
    }
}

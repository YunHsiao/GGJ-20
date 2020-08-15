import { _decorator, Component, Node, Prefab, instantiate, Vec3, randomRange } from 'cc';
import { CustomerController } from './CustomerController';
import { PlayerController } from './PlayerController';
import { AdvertisementController } from './AdvertisementController';
import { gameDefines } from './GameDefines';
import { CompanySuit } from './CompanySuit';
const { ccclass, property } = _decorator;

const tempVec3 = new Vec3();

@ccclass('GameManager')
export class GameManager extends Component {
    @property({type: PlayerController})
    public playerCtrl: PlayerController = null;
    @property({type: Prefab})
    public customerPrfb: Prefab = null;
    @property({type: Prefab})
    public companySuit: Prefab = null;
    @property
    customerCount = 10;

    private _customers: CustomerController[] = [];
    private _groundNode: Node;
    private _falloffInterval: number = 1;
    private _curFalloffTime: number = 0;
    private _companySuitInst: CompanySuit = null;

    start () {
        this._groundNode = this.node.scene.getChildByName('Ground');
        this.playerCtrl.onDropAd = this.onDropAd.bind(this);
        this.playerCtrl.onAddPrice = this.onAddPrice.bind(this);
        this.playerCtrl.onSubPrice = this.onSubPrice.bind(this);
        this.initCustomers();
        const companySuitNode = instantiate(this.companySuit);
        companySuitNode.parent = this.node;
        this._companySuitInst = companySuitNode.getComponent(CompanySuit);
    }

    initCustomers() {
        let radius = this._groundNode.scale.x * 0.5;
        for (let i = 0; i < this.customerCount; i++) {
            const inst = instantiate(this.customerPrfb) as Node;
            inst.setPosition(randomRange(-radius, radius), 0, randomRange(-radius, radius));
            inst.parent = this.node;
            const customerCtrl = inst.getComponent(CustomerController);
            customerCtrl.onBuyProduction = this.onCustomBuyProduction.bind(this);
            this._customers.push(customerCtrl);
        }
    }

    onDropAd(hitPos: Vec3, ad: AdvertisementController) {
        this._companySuitInst.handWaving();

        const affectCustomers: CustomerController[] = [];
        this._customers.forEach((customer) => {
            Vec3.subtract(tempVec3, hitPos, customer.node.getWorldPosition());
            const dist = tempVec3.length();
            if (dist <= ad.advertisementData.range) {
                affectCustomers.push(customer);
            }
        });

        let expectAttraction = ad.advertisementData.attraction;
        if (affectCustomers.length >= 2) {
            let i = 0;
            for (i = affectCustomers.length - 1; i>= 1; i-=2) {
                let c_1 = affectCustomers[i];
                let c_2 = affectCustomers[i-1];

                let attraction_1 = randomRange(-expectAttraction, expectAttraction);
                let attraction_2 = 2 * expectAttraction - attraction_1;
                c_1.addAttraction(attraction_1);
                c_2.addAttraction(attraction_2);
            }

            if (i === 0) {
                affectCustomers[0].addAttraction(expectAttraction);
            }
        } else if (affectCustomers.length === 1) {
            affectCustomers[0].addAttraction(expectAttraction);
        }
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

    onCustomBuyProduction(customer: CustomerController) {
        let count = this.playerCtrl.playerData.production.count - 1;
        if (count >= 0) {
            this.playerCtrl.playerData.production.count = count;
            this.playerCtrl.updateUITips();
        }
    }

    onAddPrice (){
        this.falloffAllCustomers(-30);
    }

    onSubPrice (){
        this.falloffAllCustomers(40);
    }
}

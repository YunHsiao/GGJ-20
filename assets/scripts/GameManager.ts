import { _decorator, Component, Node, Prefab, instantiate, Vec3, randomRange, ProgressBarComponent, LabelComponent, random } from 'cc';
import { PlayerController } from './PlayerController';
import { AdvertisementController } from './AdvertisementController';
import { CustomerController } from './CustomerController';
import { gameDefines } from './GameDefines';
import { CompanySuit } from './CompanySuit';
import { AudioManager, ClipIndex } from './AudioManager';
import { ParcelDispenser } from './ParcelDispenser';
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
    @property({type: ProgressBarComponent})
    gameProgress: ProgressBarComponent = null;
    @property({type: LabelComponent})
    taxRateLabel: LabelComponent = null;

    private _customers: CustomerController[] = [];
    private _groundNode: Node;
    private _falloffInterval: number = 1;
    private _curFalloffTime: number = 0;
    private _companySuitInst: CompanySuit = null;
    private _customerBought: number = 0;
    private _gameOver = false;
    private _taxRate = 0;

    private static _instance: GameManager;

    public static get Instance (): GameManager {
        return GameManager._instance;
    }

    public get taxRate() {
        return this._taxRate;
    }

    public set taxRate(value: number) {
        this._taxRate = value;
        if (this.taxRateLabel) {
            this.taxRateLabel.string = (this._taxRate * 100).toFixed(0) + "%";
        }
    }

    onLoad() {
        GameManager._instance = this;
    }

    start () {
        this._groundNode = this.node.scene.getChildByName('Ground');
        this.playerCtrl.onDropAd = this.onDropAd.bind(this);
        this.playerCtrl.onAddPrice = this.onAddPrice.bind(this);
        this.playerCtrl.onSubPrice = this.onSubPrice.bind(this);
        this.initCustomers();

        const companySuitNode = instantiate(this.companySuit);
        companySuitNode.parent = this.node;
        this._companySuitInst = companySuitNode.getComponent(CompanySuit);
        this.gameProgress.progress = 0;
    }

    initCustomers() {
        let radius = this._groundNode.scale.x * 0.5;
        for (let i = 0; i < this.customerCount; i++) {
            const inst = instantiate(this.customerPrfb) as Node;
            inst.setPosition(randomRange(-radius, radius), 0, randomRange(-radius, radius));
            inst.parent = this.node;
            const customerCtrl = inst.getComponent('CustomerController') as CustomerController;
            customerCtrl.onBuyProduction = this.onCustomBuyProduction.bind(this);
            this._customers.push(customerCtrl);
        }
    }

    onDropAd(hitPos: Vec3, ad: AdvertisementController) {
        this._companySuitInst.handWaving(hitPos);

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

    falloffAllCustomersInRange(attraction: number, centerCustomer: CustomerController, range: number) {
        this._customers.forEach((customer) => {
            if (customer === centerCustomer)
            {
                return;
            }
            Vec3.subtract(tempVec3, centerCustomer.node.getWorldPosition(), customer.node.getWorldPosition());
            const dist = tempVec3.length();
            if (dist <= range) {
                customer.addAttraction(attraction);
            }
        });
    }

    update (deltaTime: number) {
        // Your update function goes here.
        this.falloffAllCustomers(-gameDefines.fallofSpeed * deltaTime);
        AudioManager.instance.setBGMStage(this.gameProgress.progress);

        if (this.gameProgress.progress >= 0.99) this.gameOver();
    }

    gameOver () {
        if (!this._gameOver) {
            this._gameOver = true;
            this._companySuitInst.bailOut(() => this._customers.forEach((customer) => customer.bewildered()));
            AudioManager.instance.fadeOutAll();
            AudioManager.instance.playOneShot(ClipIndex.WIN);
        }
    }

    onCustomBuyProduction(customer: CustomerController) {
        let count = this.playerCtrl.playerData.production.count - 1;
        if (count >= 0) {
            this.playerCtrl.playerData.production.count = count;
            this._customerBought++;
            this.gameProgress.progress = this._customerBought / this.customerCount;
            // let profit = this.playerCtrl.playerData.production.price - this.playerCtrl.playerData.production.cost;
            const profit = Math.floor(this.playerCtrl.playerData.production.price * (1 - this.taxRate));
            this.playerCtrl.playerData.money += profit;
            this.playerCtrl.updateUITips();
            ParcelDispenser.instance.dispense(randomRange(0.5, 1));
        }
    }

    onAddPrice () {
        this._customers.forEach((customer) => {
            customer.addAttraction(-20);
            customer.repel();
        });

        this.taxRate = gameDefines.getTaxRateByPrice(this.playerCtrl.playerData.production.price);
    }

    onSubPrice () {
        // MAX attraction add is 50
        let attraction = 0;
        if (this.playerCtrl.playerData.production.price > (this.playerCtrl.playerData.production.cost / 2) &&
            this.playerCtrl.playerData.production.price < this.playerCtrl.playerData.production.priceLow) {
                attraction = randomRange(40, 200) / this.playerCtrl.playerData.production.priceStateNum;
                this.playerCtrl.playerData.production.priceLow = this.playerCtrl.playerData.production.price;
            }
        this.falloffAllCustomers(attraction);
        this.taxRate = gameDefines.getTaxRateByPrice(this.playerCtrl.playerData.production.price);
    }

    public queryProductionCount() {
        return this.playerCtrl.playerData.production.count;
    }
}

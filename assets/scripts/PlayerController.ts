import { _decorator, Component, Node, geometry, CameraComponent, systemEvent, SystemEvent, ModelComponent, Vec3, PhysicsSystem,
    Prefab, instantiate, director, loader, JsonAsset, LabelComponent, EventTouch, SpriteComponent } from 'cc';
import { Player, createProductionCountType } from './Player';
import { AdvertisementController } from './AdvertisementController';
import { Advertisement } from './Advertisement';
import { FirstPersonCamera } from '../first-person-camera';
import { AudioManager, ClipIndex } from './AudioManager';
const { ccclass, property } = _decorator;
const { ray } = geometry;
const outRay = new ray();

const tempVec3 = new Vec3();

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({type: Prefab})
    public rangeIndicatorPrfb: Prefab = null;
    @property({type: Prefab})
    public advertisementPrfb: Prefab = null;
    public playerData: Player;

    @property({type: LabelComponent})
    public customMoneyTips: LabelComponent = null;
    @property({type: LabelComponent})
    public customProductionPriceTips: LabelComponent = null;
    @property({type: LabelComponent})
    public customProductionCountTips: LabelComponent = null;
    @property({type: SpriteComponent})
    public customProductionCountImage: SpriteComponent = null;
    @property({type: Node})
    public adButtonGroupNode: Node = null;

    private _cameraNode: Node;
    private _cameraComp: CameraComponent;
    private _groundNode: Node;
    private _groundModelComp: ModelComponent;
    private _isTouchStarted: boolean;
    private _rangeIndicator: Node;
    private _advertisements: AdvertisementController[] = [];
    private _curSelectedAd: AdvertisementController;
    private _cameraBehavior: FirstPersonCamera = null;
    private _adButtonsGroup: Node[] = [];
    private _curSelectAdIndex = -1;

    // event
    public onDropAd: Function;
    public onAddPrice: Function;
    public onSubPrice: Function;

    start () {
        this.playerData = new Player();
        this.initAd();
        // Your initialization goes here.
        this._cameraNode = this.node.scene.getChildByName('Camera');
        this._cameraComp = this._cameraNode.getComponent(CameraComponent);
        this._groundNode = this.node.scene.getChildByName('Ground');
        this._groundModelComp = this._groundNode.getComponent(ModelComponent);
        this._rangeIndicator = instantiate(this.rangeIndicatorPrfb);
        this._cameraBehavior = this._cameraNode.getComponent(FirstPersonCamera);
        // @ts-ignore
        this._rangeIndicator.parent = director.getScene();
        this._rangeIndicator.active = false;

        this.adButtonGroupNode.children.forEach((buttons) => {
            this._adButtonsGroup.push(buttons);
        })

        systemEvent.on(SystemEvent.EventType.TOUCH_START, this.onTouchStart.bind(this));
        systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove.bind(this));
        systemEvent.on(SystemEvent.EventType.MOUSE_MOVE, this.onTouchMove.bind(this));
        systemEvent.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnd.bind(this));

        this.updateUITips();
    }

    initAd() {
        loader.loadRes('configs/advertisements.json', JsonAsset, (err, jsonObj) => {
            if (Array.isArray(jsonObj.json)) {
                jsonObj.json.forEach((adData: Advertisement) => {
                    let ad: Advertisement = new Advertisement();
                    ad.index = adData.index;
                    ad.price = adData.price;
                    ad.range = adData.range;
                    ad.range = adData.range;

                    const adNode = instantiate(this.advertisementPrfb);
                    // @ts-ignore
                    adNode.parent = director.getScene();
                    adNode.active = false;
                    const adCtrl = adNode.getComponent(AdvertisementController);
                    adCtrl.advertisementData = ad;
                    this._advertisements.push(adCtrl);
                });

                // this._curSelectedAd = this._advertisements[0];
            }
        });
    }

    update (deltaTime: number) {
        // Your update function goes here.
    }

    raycastHitGround(touchEvent: EventTouch, callBack: Function) {
        const pos = touchEvent.getLocation();
        this._cameraComp.screenPointToRay(pos.x, pos.y, outRay);
        const r = PhysicsSystem.instance.raycastResults;
        if (PhysicsSystem.instance.raycast(outRay)) {
            for (let i = 0; i < r.length; i++) {
                const item = r[i];
                if (item.collider.node.uuid === this._groundModelComp.node.uuid) {
                    if (callBack) {
                        callBack(item.hitPoint);
                    }
                    return;
                }
            }
        }
    }

    onTouchStart(event: EventTouch) {
        // this._isTouchStarted = true;
        // this._rangeIndicator.active = true;
        // const adRange = this._curSelectedAd.advertisementData.range;
        // this._rangeIndicator.setScale(new Vec3(adRange * 2, 1, adRange * 2));
        // this.raycastHitGround(event, (hitPos: Vec3) => {
        //     this._rangeIndicator.setWorldPosition(hitPos);
        // });
    }

    onTouchMove(event: EventTouch) {
        if (this._curSelectedAd) {
            this._rangeIndicator.active = true;
            this.raycastHitGround(event, (hitPos: Vec3) => {
                this._rangeIndicator.setWorldPosition(hitPos);
            })
        }
    }

    onTouchEnd(event: EventTouch) {
        // this._isTouchStarted = false;
        // this._rangeIndicator.active = false;
        if (!this._curSelectedAd) return;
        this.raycastHitGround(event, (hitPos: Vec3) => {
            this._rangeIndicator.setWorldPosition(hitPos);
            if (this._curSelectedAd.advertisementData.price < this.playerData.money) {
                this.playerData.money -= this._curSelectedAd.advertisementData.price;
                this.updateUITips();
                this._curSelectedAd.node.setWorldPosition(hitPos);
                this._curSelectedAd.show();
                this.onDropAd(hitPos, this._curSelectedAd);
            }
        })
    }

    updateUITips () {
        this.customMoneyTips.string = '' + this.playerData.money;
        this.customProductionPriceTips.string =  '' + this.playerData.production.price;
        this.customProductionCountTips.string =  '' + this.playerData.production.count;
        AudioManager.instance.playOneShot(ClipIndex.VALID_OP);
    }

    addProduction () {
        let createNum = 0;
        switch(this.playerData.createCountType) {
            case createProductionCountType.one:
                createNum = 1;
                break;
            case createProductionCountType.ten:
                createNum = 10;
                break;
            case createProductionCountType.thirty:
                createNum = 30;
                break;
            default:
                createNum = 1;
        }
        if (this.playerData.money >= this.playerData.production.cost * createNum) {
            for(let i = 0; i < createNum; i++ ) {
                this.playerData.money -= this.playerData.production.cost;
                this.playerData.production.count++;
            }
            this.updateUITips();
        } else {
            // ni mei le
            // window.close();
            // console.log('111111111');
            AudioManager.instance.playOneShot(ClipIndex.INVALID_OP);
        }
    }

    addPrice () {
        this.playerData.production.price += this.playerData.production.pricePreGrad;
        if (this.onAddPrice) {
            this.onAddPrice();
        }
        this.updateUITips();
    }

    subPrice () {
        this.playerData.production.price -= this.playerData.production.pricePreGrad;
        if (this.onSubPrice) {
            this.onSubPrice();
        }
        this.updateUITips();
    }

    public onAdButtonClicked(event: any, customData: string) {
        const target: Node = event.target;
        console.log(target);
        // get count label;
        let countLabel;
        const index = Number.parseInt(customData);
        if (this._curSelectedAd === this._advertisements[index]) {
            this._curSelectedAd = null;
            this._cameraBehavior.enableMoving = true;
            this._rangeIndicator.active = false;
            if (this._curSelectAdIndex >= 0) {
                countLabel = this._adButtonsGroup[this._curSelectAdIndex].getComponentInChildren(LabelComponent);
                countLabel.node.parent.active = false;
            }

            this._curSelectAdIndex = -1;
        }
        else {
            if (this._curSelectAdIndex >= 0) {
                countLabel = this._adButtonsGroup[this._curSelectAdIndex].getComponentInChildren(LabelComponent);
                countLabel.node.parent.active = false;
            }
            this._curSelectAdIndex = index;
            this._curSelectedAd = this._advertisements[index];
            this._cameraBehavior.enableMoving = false;
            const adRange = this._curSelectedAd.advertisementData.range;
            this._rangeIndicator.setScale(new Vec3(adRange * 2, 1, adRange * 2));
            if (this._curSelectAdIndex >= 0) {
                countLabel = this._adButtonsGroup[this._curSelectAdIndex].getComponentInChildren(LabelComponent);
                countLabel.string = '-'+this._curSelectedAd.advertisementData.price;
                countLabel.node.parent.active = true;
            }
        }
    }

    switchCreateCountType (event: any, customData: string) {
        const index = Number.parseInt(customData);
        if (index === 0) {
            if (this.playerData.createCountType === createProductionCountType.one) {
                return;
            }
            this.playerData.createCountType --;
        } else {
            if (this.playerData.createCountType === createProductionCountType.thirty) {
                return;
            }
            this.playerData.createCountType ++;
        }
        this.customProductionCountImage.spriteFrame =
        this.playerData.createCountTypeIcon[this.playerData.createCountType];
    }
}

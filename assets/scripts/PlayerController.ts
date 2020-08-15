import { _decorator, Component, Node, geometry, CameraComponent, systemEvent, SystemEvent, EventMouse, ModelComponent, Vec3, PhysicsSystem, sys, Prefab, instantiate, director, loader, JsonAsset } from 'cc';
import { Player } from './Player';
import { AdvertisementController } from './AdvertisementController';
import { Advertisement } from './Advertisement';
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

    private _cameraNode: Node;
    private _cameraComp: CameraComponent;
    private _groundNode: Node;
    private _groundModelComp: ModelComponent;
    private _isMouseDown: boolean;
    private _rangeIndicator: Node;
    private _advertisements: AdvertisementController[] = [];
    private _curSelectedAd: AdvertisementController;

    // event
    public onDropAd: Function;

    start () {
        this.playerData = new Player();
        this.initAd();
        // Your initialization goes here.
        this._cameraNode = this.node.scene.getChildByName('Camera');
        this._cameraComp = this._cameraNode.getComponent(CameraComponent);
        this._groundNode = this.node.scene.getChildByName('Ground');
        this._groundModelComp = this._groundNode.getComponent(ModelComponent);
        this._rangeIndicator = instantiate(this.rangeIndicatorPrfb);
        // @ts-ignore
        this._rangeIndicator.parent = director.getScene();
        this._rangeIndicator.active = false;

        systemEvent.on(SystemEvent.EventType.MOUSE_DOWN, this.onMouseDown.bind(this));
        systemEvent.on(SystemEvent.EventType.MOUSE_MOVE, this.onMouseMove.bind(this));
        systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp.bind(this));
    }

    initAd() {
        loader.loadRes('configs/advertisements.json', JsonAsset, (err, jsonObj) => {
            if (Array.isArray(jsonObj.json)) {
                jsonObj.json.forEach((adData: Advertisement) => {
                    let ad: Advertisement = new Advertisement();
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

                this._curSelectedAd = this._advertisements[0];
            }
        });
    }

    update (deltaTime: number) {
        // Your update function goes here.

    }

    raycastHitGround(mouseEvent: EventMouse, callBack: Function) {
        const mousePos = mouseEvent.getLocation();
        this._cameraComp.screenPointToRay(mousePos.x, mousePos.y, outRay);
        const r = PhysicsSystem.instance.raycastResults;
        if (PhysicsSystem.instance.raycast(outRay)) {
            for (let i = 0; i < r.length; i++) {
                const item = r[i];
                if (item.collider.node.uuid === this._groundModelComp.node.uuid) {
                    if (callBack) {
                        callBack(item.hitPoint);
                    }
                }
            }
        }
    }

    onMouseDown(event: EventMouse) {
        if (event.getButton() === 0) {
            this._isMouseDown = true;
            this._rangeIndicator.active = true;
            const adRange = this._curSelectedAd.advertisementData.range;
            this._rangeIndicator.setScale(new Vec3(adRange * 2, 1, adRange * 2));
            this.raycastHitGround(event, (hitPos: Vec3) => {
                this._rangeIndicator.setWorldPosition(hitPos);
            })
        }
    }

    onMouseMove(event: EventMouse) {
        if (this._isMouseDown) {
            this.raycastHitGround(event, (hitPos: Vec3) => {
                this._rangeIndicator.setWorldPosition(hitPos);
            })
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this._isMouseDown = false;
            this._rangeIndicator.active = false;
            this.raycastHitGround(event, (hitPos: Vec3) => {
                this._rangeIndicator.setWorldPosition(hitPos);
                if (this._curSelectedAd.advertisementData.price < this.playerData.money) {
                    this.playerData.money -= this._curSelectedAd.advertisementData.price;
                    this.onDropAd(hitPos, this._curSelectedAd);
                }
            })
        }
    }
}

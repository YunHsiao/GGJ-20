import { _decorator, Component, Node, ParticleSystemComponent, Vec3 } from 'cc';
import { Advertisement } from './Advertisement';
import { AdvParticle } from './AdvParticle';
const { ccclass, property } = _decorator;

@ccclass('AdvertisementController')
export class AdvertisementController extends Component {
    public advertisementData: Advertisement;
    @property({type: AdvParticle})
    public adParticle: AdvParticle = null;

    private _curPassedTime: number = 0;
    private _showTime = 0;


    show() {
        const range = this.advertisementData.range / 10;
        this.adParticle.node.setScale(new Vec3(range, range, range));
        this.adParticle.stop();
        this.adParticle.play();


        this._showTime = 2;
        this.node.active = true;
        this._curPassedTime = 0;
    }

    update (deltaTime: number) {
        // Your update function goes here.
        this._curPassedTime += deltaTime;
        if (this._curPassedTime > this._showTime) {
            this.node.active = false;
        }
    }
}

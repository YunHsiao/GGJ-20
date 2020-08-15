import { _decorator, Component, Node, ParticleSystemComponent, Vec3 } from 'cc';
import { Advertisement } from './Advertisement';
const { ccclass, property } = _decorator;

@ccclass('AdvertisementController')
export class AdvertisementController extends Component {
    public advertisementData: Advertisement;
    @property({type: ParticleSystemComponent})
    public adParticle: ParticleSystemComponent = null;
    private _subParticles: ParticleSystemComponent[] = [];

    private _curPassedTime: number = 0;
    private _showTime = 0;

    start () {
        for (let i = 0; i < this.adParticle.node.children.length; i++) {
            let subNode = this.adParticle.node.children[i];
            this._subParticles.push(subNode.getComponent(ParticleSystemComponent));
        }
    }

    show() {
        const range = this.advertisementData.range;
        //this.adParticle.node.setWorldScale(new Vec3(range, range, range));
        this.adParticle.shapeModule.radius = range;
        this.adParticle.stop();
        this.adParticle.play();
        // this._subParticles.forEach((particle) => {
        //     particle.startSizeX.constant = this.advertisementData.range;
        //     particle.stop();
        //     particle.play();
        // });


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

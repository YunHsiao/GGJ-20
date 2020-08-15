import { _decorator, Component, Node, ParticleSystemComponent, Vec3, Prefab, Pool, instantiate } from 'cc';
import { Advertisement } from './Advertisement';
const { ccclass, property } = _decorator;

@ccclass('AdvertisementController')
export class AdvertisementController extends Component {
    public advertisementData: Advertisement;
    @property({type: Prefab})
    public advertiseParticlePrfb: Prefab = null;
    public _adParticle: ParticleSystemComponent = null;
    private _subParticles: ParticleSystemComponent[] = [];

    private _curPassedTime: number = 0;
    private _showTime = 0;
    private _particlePool: Pool<Node>;

    onLoad() {
        // this._particlePool = new Pool<Node>(() => {
        //     const particleNode = instantiate(this.advertiseParticlePrfb);
        //     particleNode.parent = this.node;
        //     return particleNode;
        // }, 5);
    }

    start () {    
        // for (let i = 0; i < this._adParticle.node.children.length; i++) {
        //     let subNode = this._adParticle.node.children[i];
        //     this._subParticles.push(subNode.getComponent(ParticleSystemComponent));
        // }

    }

    show() {
        const range = this.advertisementData.range;
        const particleNode = instantiate(this.advertiseParticlePrfb);
        particleNode.parent = this.node;
        //this.adParticle.node.setWorldScale(new Vec3(range, range, range));
        const adParticle = particleNode.getComponent(ParticleSystemComponent);
        adParticle.shapeModule.radius = range;
        // this._subParticles.forEach((particle) => {
        //     particle.startSizeX.constant = this.advertisementData.range;
        //     particle.stop();
        //     particle.play();
        // });


        this._showTime = 1;
        this.node.active = true;
        this._curPassedTime = 0;
        this.scheduleOnce(()=> {
            particleNode.active = false;
            particleNode.destroy();
        }, this._showTime)
    }

    update (deltaTime: number) {
        // Your update function goes here.
    }
}

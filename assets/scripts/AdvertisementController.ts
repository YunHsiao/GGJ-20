import { _decorator, Component, Node, ParticleSystemComponent, Vec3, Prefab, Pool, instantiate } from 'cc';
import { Advertisement } from './Advertisement';
import { AdvParticle } from './AdvParticle';
const { ccclass, property } = _decorator;

@ccclass('AdvertisementController')
export class AdvertisementController extends Component {
    public advertisementData: Advertisement;
    
    @property({type: Prefab})
    public advertiseParticlePrfb: Prefab = null;

    @property({type: Prefab})
    public advertiseParticlePrfbPaper: Prefab = null;

    @property({type: Prefab})
    public advertiseParticlePrfbAirship: Prefab = null;

    public _adParticle: ParticleSystemComponent = null;

    private _showTime = 0;
    private _particlePool: Pool<AdvParticle>[] = [];

    onLoad() {
        this._particlePool[0] = new Pool<AdvParticle>(() => {
            const particleNode = instantiate(this.advertiseParticlePrfb);
            particleNode.parent = this.node.parent;
            particleNode.active = false;
            return particleNode.getComponent(AdvParticle);
        }, 5);
        this._particlePool[1] = new Pool<AdvParticle>(() => {
            const particleNode = instantiate(this.advertiseParticlePrfbPaper);
            particleNode.parent = this.node.parent;
            particleNode.active = false;
            return particleNode.getComponent(AdvParticle);
        }, 5);
        this._particlePool[2] = new Pool<AdvParticle>(() => {
            const particleNode = instantiate(this.advertiseParticlePrfbAirship);
            particleNode.parent = this.node.parent;
            particleNode.active = false;
            return particleNode.getComponent(AdvParticle);
        }, 5);
        
    }

    start () {    

    }

    show() {
        // const range = this.advertisementData.range / 10;
        const adParticle = this._particlePool[this.advertisementData.index].alloc();
        adParticle.node.active = true;
        adParticle.node.setWorldPosition(this.node.worldPosition.x, this.node.worldPosition.y + 1, this.node.worldPosition.z);
        // adParticle.node.setScale(new Vec3(range, range, range));
        adParticle.node.eulerAngles = new Vec3(adParticle.node.eulerAngles.x, 30 - Math.random() * 150, adParticle.node.eulerAngles.z);
        adParticle.stop();
        adParticle.play();


        this._showTime = 8;
        this.node.active = true;
        this.scheduleOnce(()=> {
            adParticle.node.active = false;
            this._particlePool[this.advertisementData.index].free(adParticle);
        }, this._showTime)
    }

    update (deltaTime: number) {
        // Your update function goes here.
    }
}

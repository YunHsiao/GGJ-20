import { _decorator, Component, Node, ParticleSystemComponent, AnimationComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AdvParticle')
export class AdvParticle extends Component {

    @property({type: [ParticleSystemComponent]})
    public particles: ParticleSystemComponent[] = []

    @property({type: AnimationComponent})
    public animation: AnimationComponent = null;
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    stop () {
        this.particles.forEach(x => x.stop());
    }

    play () {
        this.particles.forEach(x => x.play());
        this.animation.play();
    }
}

import { _decorator, Component, Node, ParticleSystemComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BlackPeopleEffect')
export class BlackPeopleEffect extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    @property({type: [ ParticleSystemComponent ]})
    public particles: ParticleSystemComponent[] = [];

    start () {
        // Your initialization goes here.
    }

    play () {
        this.particles.forEach(x => x.loop = true);
        this.particles.forEach(x => x.play());
    }

    stop () {
        this.particles.forEach(x => x.loop = false);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}

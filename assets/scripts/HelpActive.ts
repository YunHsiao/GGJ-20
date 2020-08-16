import { _decorator, Component, Node } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('HelpActive')
export class HelpActive extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    @property({type: Node})
    public helpNode: Node = null;

    start () {
        // Your initialization goes here.
        this.helpNode.active = true;
        this.scheduleOnce(()=> {
            this.helpNode.active = false;
        }, 10);
    }

    visableChange() {
        this.helpNode.active = !this.helpNode.active;
    }

    hide() {
        this.helpNode.active = false;
    }

    outGame () {
        GameManager.Instance.gameOver();
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}

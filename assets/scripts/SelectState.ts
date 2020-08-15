import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SelectState')
export class SelectState extends Component {

    @property({type: [Node]})
    public masks: Node[] = []
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

    onClickAdv (event, index: string) {
        if (this.masks[Number(index)].active === true) {
            this.masks[Number(index)].active = false;
        }
        else {
            this.masks.forEach(x => x.active = false);
            this.masks[Number(index)].active = true;
        }
    }

}

import { _decorator, Component, Node } from 'cc';
import { Advertisement } from './Advertisement';
const { ccclass, property } = _decorator;

@ccclass('AdvertisementController')
export class AdvertisementController extends Component {
    public advertisementData: Advertisement;

    start () {
        
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}

import { SpriteFrame, loader } from 'cc';
import { Production } from "./Production";

export enum createProductionCountType {
    one,
    ten,
    thirty,
}

const iconUrl = [
    'icon/plusx1/spriteFrame',
    'icon/plusx10/spriteFrame',
    'icon/plusx30/spriteFrame',
]

export class Player {
    public money: number = 20000;
    public production: Production;
    public createCountType: createProductionCountType;
    public createCountTypeIcon: SpriteFrame[] = [];

    constructor() {
        this.production = new Production(200, 0, 100);
        this.createCountType = createProductionCountType.one;
        let loadCallBack = this._loadCallBack.bind(this);
        for (let i = 0; i < iconUrl.length; i++) {
            loader.loadRes(iconUrl[i], SpriteFrame, loadCallBack);
        }
    }

    _loadCallBack(err, res) {
        this.createCountTypeIcon.push(res);
    }
}

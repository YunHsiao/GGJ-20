import { Production } from "./Production";

export class Player {
    public money: number = 2000;
    public production: Production;

    constructor() {
        this.production = new Production(10, 10);
    }
}
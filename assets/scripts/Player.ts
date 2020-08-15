import { Production } from "./Production";

export class Player {
    public money: number = 0;
    public production: Production;

    constructor() {
        this.production = new Production(10, 10);
    }
}
import { Unit } from "./Unit";

export class Customer extends Unit {
    public minAttraction: number = 30 // 最低吸引力
    private _attraction: number = 50;  // 吸引力

    public get attraction() {
        return this._attraction;
    }

    public set attraction(value: number) {
        let newValue = value;
        if (newValue < this.minAttraction) {
            newValue = this.minAttraction;
        }

        this._attraction = newValue;
    }
}
import { Unit } from "./Unit";
import { clamp, randomRangeInt } from "cc";

export class Customer extends Unit {
    public static minAttraction: number = 0;   // 最低吸引力
    public static maxAttraction: number = 100; // 最高吸引力

    public baseAttraction: number = randomRangeInt(0, 50); // 基础吸引力

    private _attraction: number = 50;  // 当前吸引力

    public get attraction() {
        return this._attraction;
    }

    public set attraction(value: number) {
        this._attraction = clamp(value, this.baseAttraction, Customer.maxAttraction);
    }
}

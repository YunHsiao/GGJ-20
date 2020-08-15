export class Production {
    public count: number;
    public price: number;
    public cost: number;

    public priceLow: number;
    public priceStateNum: number = 5;
    public pricePreGrad: number;
    constructor(price: number, count: number, cost: number) {
        this.price = price;
        this.count = count;
        this.cost = cost;

        this.priceLow = price;
        this.pricePreGrad = (price - cost) / this.priceStateNum;
    }
}
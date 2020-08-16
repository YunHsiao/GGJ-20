
class GameDefines {
    public fallofSpeed: number = 20; // 衰减速度
    public minTaxPriceThread = 300; // 最低收税标准
    public maxPrice = 2000; // 最高价格

    public getTaxRateByPrice(price: number) {
        if (price > this.minTaxPriceThread) {
            let rate = ((price - this.minTaxPriceThread) / (this.maxPrice - this.minTaxPriceThread)) * 0.9;
            rate = Number.parseFloat(rate.toFixed(2));
            console.log(rate);
            return rate;
        } else {
            return 0;
        }
    }
}
const gameDefines = new GameDefines();
export { gameDefines };

import { expect } from "chai";

export default (): void => {
  it(`ACDM-VIEW: TokenACDM equal to constructor argument`, async function (): Promise<void> {
    const token = await this.instanceACDM.TokenACDM();
    expect(token).to.equal(this.acdmArguments[5]);
  });
  it(`ACDM-VIEW: roundDuration equal to constructor argument`, async function (): Promise<void> {
    const roundDuration = await this.instanceACDM.roundDuration();
    expect(roundDuration).to.equal(this.acdmArguments[0]);
  });
  it(`ACDM-VIEW: priceRatioPercent equal to constructor argument`, async function (): Promise<void> {
    const priceRatioPercent = await this.instanceACDM.priceRatioPercent();
    expect(priceRatioPercent).to.equal(this.acdmArguments[3]);
  });
  it(`ACDM-VIEW: priceRatioAmount equal to constructor argument`, async function (): Promise<void> {
    const priceRatioAmount = await this.instanceACDM.priceRatioAmount();
    expect(priceRatioAmount).to.equal(this.acdmArguments[4]);
  });
};

import { expect } from "chai";

export default (): void => {
  it(`ERC20-VIEW: Name equal to constructor argument`, async function (): Promise<void> {
    const name = await this.instance.name();
    expect(name).to.equal(this.erc20Arguments[0]);
  });
  it(`ERC20-VIEW: Symbol equal to constructor argument`, async function (): Promise<void> {
    const symbol = await this.instance.symbol();
    expect(symbol).to.equal(this.erc20Arguments[1]);
  });
};

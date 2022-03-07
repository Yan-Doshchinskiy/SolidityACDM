import { expect } from "chai";
import { BigNumber } from "ethers";

export default (): void => {
  it(`ERC20-SUPPLY: only ACDM account can call mint function (completed)`, async function (): Promise<void> {
    await this.instance
      .connect(this.acdmContract)
      .mint(this.user1.address, this.testMintAmount);
    const balance = await this.instance.balanceOf(this.user1.address);
    expect(balance).to.be.equal(this.testMintAmount);
  });
  it(`ERC20-SUPPLY: only ACDM account can call mint function (reverted)`, async function (): Promise<void> {
    await expect(
      this.instance.mint(this.user1.address, this.testMintAmount)
    ).to.be.revertedWith("AccessControl:");
  });
  it(`ERC20-SUPPLY: only ACDM account can call burn function (completed)`, async function (): Promise<void> {
    await this.instance
      .connect(this.acdmContract)
      .mint(this.user1.address, this.testMintAmount);
    const oldBalance = await this.instance.balanceOf(this.user1.address);
    await this.instance
      .connect(this.acdmContract)
      .burn(this.user1.address, this.testBurnAmount);
    const balance = await this.instance.balanceOf(this.user1.address);
    const expectedBalance = BigNumber.from(oldBalance).sub(this.testBurnAmount);
    expect(balance).to.be.equal(expectedBalance);
  });
  it(`ERC20-SUPPLY: only ACDM account can call burn function (reverted) `, async function (): Promise<void> {
    await this.instance
      .connect(this.acdmContract)
      .mint(this.user1.address, this.testMintAmount);
    await expect(
      this.instance.burn(this.user1.address, this.testBurnAmount)
    ).to.be.revertedWith("AccessControl:");
  });
};

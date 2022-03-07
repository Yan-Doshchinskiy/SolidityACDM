import { expect } from "chai";

export default (): void => {
  it(`ERC20-VIEW: ACDM role address equal to constructor argument`, async function (): Promise<void> {
    const acdm = await this.instance.contractACDM();
    expect(acdm).to.equal(this.erc20Arguments[2]);
  });
  it(`ERC20-VIEW: changeRoleACDM function works correctly`, async function (): Promise<void> {
    const acdm1 = await this.instance.contractACDM();
    expect(acdm1).to.equal(this.erc20Arguments[2]);
    await this.instance.changeRoleACDM(this.user1.address);
    const acdm2 = await this.instance.contractACDM();
    expect(acdm2).to.not.equal(this.erc20Arguments[2]);
    expect(acdm2).to.be.equal(this.user1.address);
  });
  it(`ERC20-VIEW: only owner can call changeRoleACDM function`, async function (): Promise<void> {
    await expect(
      this.instance
        .connect(this.user1.address)
        .changeRoleACDM(this.user1.address)
    ).to.be.revertedWith("AccessControl:");
  });
};

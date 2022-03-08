import { expect } from "chai";

export default (): void => {
  it(`ACDM-REGISTRATION: overloaded registration function works correctly (completed)`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    const user1 = await this.instanceACDM.getUserData(this.user1.address);
    expect(user1.registered).to.be.equal(true);
    expect(user1.refers.length).to.be.equal(0);
  });
  it(`ACDM-REGISTRATION: overloaded registration function works correctly (reverted with "REGISTRATION: the user is already registered")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    const user1 = await this.instanceACDM.getUserData(this.user1.address);
    expect(user1.registered).to.be.equal(true);
    expect(user1.refers.length).to.be.equal(0);
    await expect(
      this.instanceACDM.connect(this.user1)["registration()"]()
    ).to.be.revertedWith("REGISTRATION: the user is already registered");
  });
  it(`ACDM-REGISTRATION: registration function works correctly (completed)`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM
      .connect(this.user2)
      ["registration(address)"](this.user1.address);
    const user2 = await this.instanceACDM.getUserData(this.user2.address);
    expect(user2.registered).to.be.equal(true);
    expect(user2.refers).to.be.eql([this.user1.address]);
    await this.instanceACDM
      .connect(this.user3)
      ["registration(address)"](this.user2.address);
    const user3 = await this.instanceACDM.getUserData(this.user3.address);
    expect(user3.registered).to.be.equal(true);
    expect(user3.refers).to.be.eql([this.user2.address, this.user1.address]);
    await this.instanceACDM
      .connect(this.user4)
      ["registration(address)"](this.user3.address);
    const user4 = await this.instanceACDM.getUserData(this.user4.address);
    expect(user4.registered).to.be.equal(true);
    expect(user4.refers).to.be.eql([this.user3.address, this.user2.address]);
  });
  it(`ACDM-REGISTRATION: registration function works correctly (reverted with: "REGISTRATION: you cannot specify yourself as a referral")`, async function (): Promise<void> {
    await expect(
      this.instanceACDM
        .connect(this.user1)
        ["registration(address)"](this.user1.address)
    ).to.be.revertedWith(
      "REGISTRATION: you cannot specify yourself as a referral"
    );
  });
  it(`ACDM-REGISTRATION: registration function works correctly (reverted with: "REGISTRATION: the user is already registered")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM
      .connect(this.user2)
      ["registration(address)"](this.user1.address);
    await expect(
      this.instanceACDM
        .connect(this.user2)
        ["registration(address)"](this.user1.address)
    ).to.be.revertedWith("REGISTRATION: the user is already registered");
  });
  it(`ACDM-REGISTRATION: getUserData function works correctly (reverted)`, async function (): Promise<void> {
    await expect(
      this.instanceACDM.getUserData(this.user1.address)
    ).to.be.revertedWith("USER: user is not registered");
  });
};

import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export default (): void => {
  it(`ACDM-SALE-ROUND: buyTokens function works correctly (completed)`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM
      .connect(this.user2)
      ["registration(address)"](this.user1.address);
    await this.instanceACDM.getUserData(this.user2.address);
    await this.instanceACDM
      .connect(this.user3)
      ["registration(address)"](this.user2.address);
    await this.instanceACDM.getUserData(this.user3.address);
    await this.instanceACDM
      .connect(this.user4)
      ["registration(address)"](this.user3.address);
    await this.instanceACDM.getUserData(this.user4.address);
    await this.instanceACDM.launchACDM();
    const { tokenPrice } = await this.instanceACDM.getRoundData(1);
    const ethAmount = BigNumber.from(this.buyAmount1)
      .mul(tokenPrice)
      .div(this.bigDecimals);
    const mainReferEth = ethAmount
      .div(100)
      .mul(this.acdmArguments[5])
      .div(10 ** 3);
    const secReferEth = ethAmount
      .div(100)
      .mul(this.acdmArguments[6])
      .div(10 ** 3);
    const acdmEth = ethAmount.sub(mainReferEth).sub(secReferEth);
    const { supply } = await this.instanceACDM.getRoundData(1);

    await expect(
      await this.instanceACDM
        .connect(this.user3)
        .buyTokens(this.buyAmount1, { value: this.ethAmount1 })
    ).to.be.changeEtherBalances(
      [this.user3, this.instanceACDM, this.user2, this.user1],
      [
        -Number(ethAmount),
        Number(acdmEth),
        Number(mainReferEth),
        Number(secReferEth),
      ]
    );
    const userBalance = await this.instanceToken.balanceOf(this.user3.address);
    expect(userBalance).to.be.equal(this.buyAmount1);
    const { supply: supply2 } = await this.instanceACDM.getRoundData(1);
    expect(supply2).to.be.equal(BigNumber.from(supply).sub(this.buyAmount1));

    const ethAmount2 = BigNumber.from(this.buyAmount2)
      .mul(tokenPrice)
      .div(this.bigDecimals);
    const mainReferEth2 = ethAmount2
      .div(100)
      .mul(this.acdmArguments[5])
      .div(10 ** 3);
    const acdmEth2 = ethAmount2.sub(mainReferEth2);
    await expect(
      await this.instanceACDM
        .connect(this.user2)
        .buyTokens(this.buyAmount2, { value: this.ethAmount2 })
    ).to.be.changeEtherBalances(
      [this.user2, this.instanceACDM, this.user1],
      [-Number(ethAmount2), Number(acdmEth2), Number(mainReferEth2)]
    );
    const userBalance2 = await this.instanceToken.balanceOf(this.user2.address);
    expect(userBalance2).to.be.equal(this.buyAmount2);

    const ethAmount3 = BigNumber.from(this.buyAmount3)
      .mul(tokenPrice)
      .div(this.bigDecimals);
    await expect(
      await this.instanceACDM
        .connect(this.user1)
        .buyTokens(this.buyAmount3, { value: this.ethAmount3 })
    ).to.be.changeEtherBalances(
      [this.user1, this.instanceACDM],
      [-Number(ethAmount3), Number(ethAmount3)]
    );
    const userBalance3 = await this.instanceToken.balanceOf(this.user1.address);
    expect(userBalance3).to.be.equal(this.buyAmount3);
  });
  it(`ACDM-SALE-ROUND: buyTokens function works correctly (reverted with: "USER: user is not registered")`, async function (): Promise<void> {
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .buyTokens(this.buyAmount1, { value: this.ethAmount1 })
    ).to.be.revertedWith("USER: user is not registered");
  });
  it(`ACDM-SALE-ROUND: buyTokens function works correctly (reverted with: "ROUND: insufficient amount of tokens on the contract balance")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM.launchACDM();
    await this.instanceACDM
      .connect(this.user1)
      .buyTokens(this.halfAmount, { value: this.ethAmount1 });
    await this.instanceACDM
      .connect(this.user1)
      .buyTokens(this.halfAmount, { value: this.ethAmount1 });
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .buyTokens(this.halfAmount, { value: this.ethAmount1 })
    ).to.be.revertedWith(
      "ROUND: insufficient amount of tokens on the contract balance"
    );
  });
  it(`ACDM-SALE-ROUND: buyTokens function works correctly (reverted with: "ROUND: the sale round is not active")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .buyTokens(this.halfAmount, { value: this.ethAmount1 })
    ).to.be.revertedWith("ROUND: the sale round is not active");
    await this.instanceACDM.launchACDM();
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .buyTokens(this.halfAmount, { value: this.ethAmount1 })
    ).to.be.revertedWith("ROUND: the sale round is not active");
    await this.instanceACDM.connect(this.user1).nextRound();
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .buyTokens(this.halfAmount, { value: this.ethAmount1 })
    ).to.be.revertedWith("ROUND: the sale round is not active");
  });

  it(`ACDM-SALE-ROUND: buyTokens function works correctly (reverted with: "ROUND: not enough ether sent")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM.launchACDM();
    await expect(
      this.instanceACDM.connect(this.user1).buyTokens(this.halfAmount)
    ).to.be.revertedWith("ROUND: not enough ether sent");
  });
};

import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { RoundStatus } from "../../interfaces/ACDM";

export default (): void => {
  it(`ACDM-TRADE-ROUND: createOrder and finishOrder functions works correctly (completed)`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM.launchACDM();
    await this.instanceACDM
      .connect(this.user1)
      .buyTokens(this.halfAmount, { value: this.ethAmount1 });
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await this.instanceACDM.connect(this.user1).nextRound();
    await this.instanceToken
      .connect(this.user1)
      .approve(this.instanceACDM.address, this.halfAmount.div(2));
    await this.instanceACDM
      .connect(this.user1)
      .createOrder(this.halfAmount.div(2), this.testPrice1);
    const balance1 = await this.instanceToken.balanceOf(this.user1.address);
    expect(balance1).to.be.equal(BigNumber.from(this.halfAmount.div(2)));
    const { status, amount, price, owner } =
      await this.instanceACDM.getOrderData(1);
    expect([status, amount, price, owner]).to.be.eql([
      RoundStatus.PROGRESS,
      this.halfAmount.div(2),
      BigNumber.from(this.testPrice1),
      this.user1.address,
    ]);
    await this.instanceACDM.connect(this.user1).finishOrder(1);
    const { status: status1 } = await this.instanceACDM.getOrderData(1);
    expect(status1).to.be.eql(RoundStatus.FINISHED);
    const balance2 = await this.instanceToken.balanceOf(this.user1.address);
    expect(balance2).to.be.equal(BigNumber.from(this.halfAmount));
  });
  it(`ACDM-TRADE-ROUND: createOrder functions works correctly (reverted with: "TRADE-ROUND: the trade round is not active")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM.launchACDM();
    await this.instanceACDM
      .connect(this.user1)
      .buyTokens(this.halfAmount, { value: this.ethAmount1 });
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .createOrder(this.halfAmount, this.testPrice1)
    ).to.be.revertedWith("TRADE-ROUND: the trade round is not active");
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await this.instanceACDM.connect(this.user1).nextRound();
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .createOrder(this.halfAmount, this.testPrice1)
    ).to.be.revertedWith("TRADE-ROUND: the trade round is not active");
  });
  it(`ACDM-TRADE-ROUND: createOrder functions works correctly (reverted with: "TRADE-ROUND: not enough token on user balance")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM.launchACDM();
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await this.instanceACDM.connect(this.user1).nextRound();
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .createOrder(this.halfAmount, this.testPrice1)
    ).to.be.revertedWith("TRADE-ROUND: not enough token on user balance");
  });
  it(`ACDM-TRADE-ROUND: finishOrder functions works correctly (reverted with: "TRADE-ROUND: order is not in progress")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM.launchACDM();
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await this.instanceACDM.connect(this.user1).nextRound();
    await expect(
      this.instanceACDM.connect(this.user1).finishOrder(3)
    ).to.be.revertedWith("TRADE-ROUND: order is not in progress");
  });
  it(`ACDM-TRADE-ROUND: finishOrder functions works correctly (reverted with: "TRADE-ROUND: you are not an owner")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM.launchACDM();
    await this.instanceACDM
      .connect(this.user1)
      .buyTokens(this.halfAmount, { value: this.ethAmount1 });
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await this.instanceACDM.connect(this.user1).nextRound();
    await this.instanceToken
      .connect(this.user1)
      .approve(this.instanceACDM.address, this.halfAmount.div(2));
    await this.instanceACDM
      .connect(this.user1)
      .createOrder(this.halfAmount.div(2), this.testPrice1);
    await expect(
      this.instanceACDM.connect(this.user2).finishOrder(1)
    ).to.be.revertedWith("TRADE-ROUND: you are not an owner");
  });
  it(`ACDM-TRADE-ROUND: nextRound functions works correctly (reverted with: "ROUND: the round is not finished")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM.launchACDM();
    await this.instanceACDM
      .connect(this.user1)
      .buyTokens(this.halfAmount, { value: this.ethAmount1 });
    await expect(
      this.instanceACDM.connect(this.user1).nextRound()
    ).to.be.revertedWith("ROUND: the round is not finished");
  });
  it(`ACDM-TRADE-ROUND: buyOrder and finishOrder functions works correctly (completed)`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM
      .connect(this.user2)
      ["registration(address)"](this.user1.address);
    await this.instanceACDM
      .connect(this.user3)
      ["registration(address)"](this.user2.address);
    await this.instanceACDM
      .connect(this.user4)
      ["registration(address)"](this.user3.address);
    await this.instanceACDM.launchACDM();
    await this.instanceACDM
      .connect(this.user4)
      .buyTokens(this.halfAmount.div(2), { value: this.ethAmount1 });
    await this.instanceACDM
      .connect(this.user3)
      .buyTokens(this.halfAmount.div(2), { value: this.ethAmount1 });
    await this.instanceACDM
      .connect(this.user2)
      .buyTokens(this.halfAmount.div(2), { value: this.ethAmount1 });
    await this.instanceACDM
      .connect(this.user1)
      .buyTokens(this.halfAmount.div(2), { value: this.ethAmount1 });
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await this.instanceACDM.connect(this.user4).nextRound();
    await this.instanceToken
      .connect(this.user4)
      .approve(this.instanceACDM.address, this.halfAmount.div(2));
    await this.instanceACDM
      .connect(this.user4)
      .createOrder(this.halfAmount.div(2), this.testPrice1);

    const { price } = await this.instanceACDM.getOrderData(1);
    const ethAmount = this.halfAmount.div(2).mul(price).div(this.bigDecimals);
    const referEth = ethAmount
      .div(100)
      .mul(this.acdmArguments[7])
      .div(10 ** 3);
    const acdmEth = ethAmount.sub(referEth).sub(referEth);
    await expect(
      await this.instanceACDM
        .connect(this.user1)
        .buyOrder(1, this.halfAmount.div(2), { value: this.ethAmount1 })
    ).to.be.changeEtherBalances(
      [this.user1, this.user4, this.user3, this.user2],
      [ethAmount.mul(-1), acdmEth, referEth, referEth]
    );

    await this.instanceToken
      .connect(this.user2)
      .approve(this.instanceACDM.address, this.halfAmount.div(2));
    await this.instanceACDM
      .connect(this.user2)
      .createOrder(this.halfAmount.div(2), this.testPrice1);
    const acdmEth2 = ethAmount.sub(referEth);
    await expect(
      await this.instanceACDM
        .connect(this.user4)
        .buyOrder(2, this.halfAmount.div(2), { value: this.ethAmount1 })
    ).to.be.changeEtherBalances(
      [this.user4, this.user2, this.user1],
      [ethAmount.mul(-1), acdmEth2, referEth]
    );

    await this.instanceToken
      .connect(this.user1)
      .approve(this.instanceACDM.address, this.halfAmount.div(2));
    await this.instanceACDM
      .connect(this.user1)
      .createOrder(this.halfAmount.div(2), this.testPrice1);
    await expect(
      await this.instanceACDM
        .connect(this.user4)
        .buyOrder(3, this.halfAmount.div(2), { value: this.ethAmount1 })
    ).to.be.changeEtherBalances(
      [this.user4, this.user1],
      [ethAmount.mul(-1), ethAmount]
    );
  });
  it(`ACDM-TRADE-ROUND: buyOrder and finishOrder functions works correctly (reverted with: "TRADE-ROUND: the trade round is not active")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM.launchACDM();
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .buyOrder(1, this.halfAmount.div(2), { value: this.ethAmount1 })
    ).to.be.revertedWith("TRADE-ROUND: the trade round is not active");
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .buyOrder(1, this.halfAmount.div(2), { value: this.ethAmount1 })
    ).to.be.revertedWith("TRADE-ROUND: the trade round is not active");
  });
  it(`ACDM-TRADE-ROUND: buyOrder and finishOrder functions works correctly (reverted with: "TRADE-ROUND: the order is not exist")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM.launchACDM();
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await this.instanceACDM.connect(this.user4).nextRound();
    await expect(
      this.instanceACDM
        .connect(this.user1)
        .buyOrder(2, this.halfAmount.div(2), { value: this.ethAmount1 })
    ).to.be.revertedWith("TRADE-ROUND: the order is not exist");
  });
  it(`ACDM-TRADE-ROUND: buyOrder and finishOrder functions works correctly (reverted with: "ROUND: insufficient amount of tokens on the owner balance")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM
      .connect(this.user2)
      ["registration(address)"](this.user1.address);
    await this.instanceACDM
      .connect(this.user3)
      ["registration(address)"](this.user2.address);
    await this.instanceACDM
      .connect(this.user4)
      ["registration(address)"](this.user3.address);
    await this.instanceACDM.launchACDM();
    await this.instanceACDM
      .connect(this.user4)
      .buyTokens(this.halfAmount.div(2), { value: this.ethAmount1 });
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await this.instanceACDM.connect(this.user4).nextRound();
    await this.instanceToken
      .connect(this.user4)
      .approve(this.instanceACDM.address, this.halfAmount.div(2));
    await this.instanceACDM
      .connect(this.user4)
      .createOrder(this.halfAmount.div(2), this.testPrice1);

    await expect(
      this.instanceACDM
        .connect(this.user1)
        .buyOrder(1, this.halfAmount, { value: this.ethAmount1 })
    ).to.be.revertedWith(
      "ROUND: insufficient amount of tokens on the owner balance"
    );
  });
  it(`ACDM-TRADE-ROUND: buyOrder and finishOrder functions works correctly (reverted with: "ROUND: not enough ether sent")`, async function (): Promise<void> {
    await this.instanceACDM.connect(this.user1)["registration()"]();
    await this.instanceACDM
      .connect(this.user2)
      ["registration(address)"](this.user1.address);
    await this.instanceACDM
      .connect(this.user3)
      ["registration(address)"](this.user2.address);
    await this.instanceACDM
      .connect(this.user4)
      ["registration(address)"](this.user3.address);
    await this.instanceACDM.launchACDM();
    await this.instanceACDM
      .connect(this.user4)
      .buyTokens(this.halfAmount.div(2), { value: this.ethAmount1 });
    await ethers.provider.send("evm_increaseTime", [this.acdmArguments[0]]);
    await this.instanceACDM.connect(this.user4).nextRound();
    await this.instanceToken
      .connect(this.user4)
      .approve(this.instanceACDM.address, this.halfAmount.div(2));
    await this.instanceACDM
      .connect(this.user4)
      .createOrder(this.halfAmount.div(2), this.testPrice1);

    await expect(
      this.instanceACDM.connect(this.user1).buyOrder(1, this.halfAmount.div(2))
    ).to.be.revertedWith("ROUND: not enough ether sent");
  });
};

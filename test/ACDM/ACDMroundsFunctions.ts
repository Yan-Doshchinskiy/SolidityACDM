import { expect } from "chai";
import { RoundStatus, RoundType } from "../../interfaces/ACDM";
import { BigNumber } from "ethers";

export default (): void => {
  it(`ACDM-ROUNDS: first round data is correct. getRoundData function works correctly (completed)`, async function (): Promise<void> {
    const [
      status,
      roundType,
      startTime,
      endTime,
      supply,
      ethAmount,
      tokenPrice,
    ] = await this.instanceACDM.getRoundData(1);
    const result = [
      status,
      roundType,
      startTime,
      endTime,
      supply,
      ethAmount,
      tokenPrice,
    ];
    const expectedTokenPrice = BigNumber.from(this.acdmArguments[2]).div(
      this.acdmArguments[1]
    );
    const expected = [
      RoundStatus.NONE,
      RoundType.SALE,
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(this.acdmArguments[1]),
      BigNumber.from(this.acdmArguments[2]),
      expectedTokenPrice,
    ];
    expect(result).to.eql(expected);
  });
  it(`ACDM-ROUNDS: getRoundData function works correctly (reverted)`, async function (): Promise<void> {
    await expect(this.instanceACDM.getRoundData(2)).to.be.revertedWith(
      "ROUND: expect a valid round id"
    );
  });
};

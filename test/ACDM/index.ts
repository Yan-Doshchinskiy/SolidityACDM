// eslint-disable-next-line node/no-missing-import
import { ethers, artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";
import { getTokenArguments } from "../../arguments/ERC20";
import { getAcdmArguments } from "../../arguments/ACDM";
import viewFunctions from "./ACDMviewFunctions";
import registrationFunctions from "./ACDMregistrationFunctions";
import roundsFunctions from "./ACDMroundsFunctions";
import saleRoundFunctions from "./ACDMsaleRoundFunctions";
import tradeRoundFunctions from "./ACDMtradeRoundFunctions";
import { BigNumber } from "ethers";

export default describe("ACDM contract testing", async function () {
  before(async function () {
    this.ethers = ethers;
    [this.owner, this.user1, this.user2, this.user3, this.user4] =
      await ethers.getSigners();
    this.ethAmount1 = "500000000000000000";
    this.ethAmount2 = "1000000000000000000";
    this.ethAmount3 = "800000000000000000";
    this.buyAmount1 = "50000000000000000000";
    this.buyAmount2 = "90000000000000000000";
    this.buyAmount3 = "180000000000000000000";
    this.testPrice1 = "3000000000000";
    this.testPrice1 = "1000000000000";
    this.testPrice1 = "1200000000000";
  });

  beforeEach(async function () {
    const artifactEthToken: Artifact = await artifacts.readArtifact(
      "ERC20forACDM"
    );
    this.instanceToken = await waffle.deployContract(
      this.owner,
      artifactEthToken,
      getTokenArguments()
    );
    this.bigDecimals = BigNumber.from(10).pow(
      await this.instanceToken.decimals()
    );
    this.acdmArguments = getAcdmArguments(this.instanceToken.address);
    this.halfAmount = BigNumber.from(this.acdmArguments[1]).div(2);
    const artifactACDM: Artifact = await artifacts.readArtifact("ACDM");
    this.instanceACDM = await waffle.deployContract(
      this.owner,
      artifactACDM,
      this.acdmArguments
    );
    this.erc20Arguments = getTokenArguments(this.instanceACDM.address);
    await this.instanceToken.changeRoleACDM(this.instanceACDM.address);
  });
  viewFunctions();
  registrationFunctions();
  roundsFunctions();
  saleRoundFunctions();
  tradeRoundFunctions();
});

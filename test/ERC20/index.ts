// eslint-disable-next-line node/no-missing-import
import { ethers, artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";
import { getAcdmArguments } from "../../arguments/ERC20";
import viewFunctions from "./ERC20viewFunctions";
import supplyFunctions from "./ERC20supplyFunctions";
import rolesFunctions from "./ERC20rolesFunctions";

export default describe("ERC20 contract testing", async function () {
  before(async function () {
    this.ethers = ethers;
    [this.owner, this.acdmContract, this.user1, this.user2] =
      await ethers.getSigners();
    this.erc20Arguments = getAcdmArguments(this.acdmContract.address);
    this.testMintAmount = "20000000000000000000000000";
    this.testBurnAmount = "5000000000000000000000000";
  });

  beforeEach(async function () {
    const artifactEthToken: Artifact = await artifacts.readArtifact(
      "ERC20forACDM"
    );
    this.instance = await waffle.deployContract(
      this.owner,
      artifactEthToken,
      this.erc20Arguments
    );
  });
  viewFunctions();
  rolesFunctions();
  supplyFunctions();
});

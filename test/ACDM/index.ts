// eslint-disable-next-line node/no-missing-import
import { ethers, artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";
import { getTokenArguments } from "../../arguments/ERC20";
import { getAcdmArguments } from "../../arguments/ACDM";
import viewFunctions from "./ACDMviewFunctions";
import registrationFunctions from "./ACDMregistrationFunctions";
import roundsFunctions from "./ACDMroundsFunctions";

export default describe("ACDM contract testing", async function () {
  before(async function () {
    this.ethers = ethers;
    [this.owner, this.user1, this.user2, this.user3, this.user4] =
      await ethers.getSigners();
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
    this.acdmArguments = getAcdmArguments(this.instanceToken.address);
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
});

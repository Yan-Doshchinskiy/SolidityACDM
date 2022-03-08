import hre, { ethers } from "hardhat";
import { Chains } from "../interfaces/enums";
import argumentsERC20 from "../arguments/ERC20";
import { getAcdmArguments } from "../arguments/ACDM";

// npx hardhat run --network rinkeby scripts/deploy.ts
// npx hardhat verify --network rinkeby --constructor-args ./arguments/ERC20.ts 0x4D7200BBe3f6FD191B394DB5E2CDD54722119fc9
// npx hardhat verify --network rinkeby --constructor-args ./arguments/ACDM.ts 0xC4a3F10B7a9ce41D31F596875A95beA8Eb189AE4

async function main(): Promise<void> {
  const net = hre.network.name;
  if (net !== Chains.RINKEBY) {
    throw new Error(`Invalid chain. Expected chain: ${Chains.RINKEBY}`);
  }
  const [deployer] = await ethers.getSigners();
  // deploy ERC20 token
  const TokenContractName = "ERC20forACDM";
  console.log(
    `Deploying ${TokenContractName} contract with the account:`,
    deployer.address
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const TokenFactory = await ethers.getContractFactory(TokenContractName);
  const TokenContract = await TokenFactory.deploy(...argumentsERC20);
  await TokenContract.deployed();
  console.log("Eth Token Contract deployed to:", TokenContract.address);
  // deploy ACDM contract
  const AcdmContractName = "ACDM";
  console.log(
    `Deploying ${AcdmContractName} contract with the account:`,
    deployer.address
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const AcdmFactory = await ethers.getContractFactory(AcdmContractName);
  const AcdmContract = await AcdmFactory.deploy(
    ...getAcdmArguments(TokenContract.address)
  );
  await AcdmContract.deployed();
  console.log("ACDM Contract deployed to:", AcdmContract.address);
  // change ACDM_ROLE
  TokenContract.changeRoleACDM(AcdmContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

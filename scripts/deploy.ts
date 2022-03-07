// import hre, { ethers } from "hardhat";
// import { Chains } from "../interfaces/enums";
// import argumentsERC20 from "../arguments/ERC20";
// import argumentsZavod from "../arguments/Zavod";
// import { getDaoArguments } from "../arguments/DAO";
//
// // npx hardhat run --network rinkeby scripts/deploy.ts
// // npx hardhat verify --network rinkeby --constructor-args ./arguments/ERC20.ts 0x12d652F2DA7f01F27dDabA2CfD30e23734119384
// // npx hardhat verify --network rinkeby --constructor-args ./arguments/Zavod.ts 0xc92825996ed49b5Ccb159dFC963bd0f59F01f1e4
// // npx hardhat verify --network rinkeby --constructor-args ./arguments/DAO.ts 0x087073e1d25E2eb69e0Aed7f10ae216de0Bb85A1
//
// async function main(): Promise<void> {
//   const net = hre.network.name;
//   if (net !== Chains.RINKEBY) {
//     throw new Error(`Invalid chain. Expected chain: ${Chains.RINKEBY}`);
//   }
//   const [deployer] = await ethers.getSigners();
//   // deploy ERC20 token
//   const TokenContractName = "ERC20ForDAO";
//   console.log(
//     `Deploying ${TokenContractName} contract with the account:`,
//     deployer.address
//   );
//   console.log("Account balance:", (await deployer.getBalance()).toString());
//   const TokenFactory = await ethers.getContractFactory(TokenContractName);
//   const TokenContract = await TokenFactory.deploy(...argumentsERC20);
//   await TokenContract.deployed();
//   console.log("Eth Token Contract deployed to:", TokenContract.address);
//   // deploy Zavod contract
//   const ZavodContractName = "Zavod";
//   console.log(
//     `Deploying ${ZavodContractName} contract with the account:`,
//     deployer.address
//   );
//   console.log("Account balance:", (await deployer.getBalance()).toString());
//   const ZavodFactory = await ethers.getContractFactory(ZavodContractName);
//   const ZavodContract = await ZavodFactory.deploy(...argumentsZavod);
//   await ZavodContract.deployed();
//   console.log("Zavod Contract deployed to:", ZavodContract.address);
//   // deploy DAO contract
//   const DaoContractName = "DAO";
//   console.log(
//     `Deploying ${DaoContractName} contract with the account:`,
//     deployer.address
//   );
//   console.log("Account balance:", (await deployer.getBalance()).toString());
//   const DaoFactory = await ethers.getContractFactory(DaoContractName);
//   const DaoContract = await DaoFactory.deploy(
//     ...getDaoArguments(TokenContract.address)
//   );
//   await DaoContract.deployed();
//   console.log("DAO Contract deployed to:", DaoContract.address);
// }
//
// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

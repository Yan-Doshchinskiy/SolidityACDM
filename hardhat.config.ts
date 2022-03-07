import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import { EthGasReporterConfig } from "hardhat-gas-reporter/src/types";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks/index.ts";
import { ChainEnv, Chains } from "./interfaces/enums";
import { NetworkUserConfig } from "hardhat/src/types/config";

dotenv.config();

interface IConfig extends HardhatUserConfig {
  gasReporter?: EthGasReporterConfig;
}

const reportGas = process.env.REPORT_GAS === "true";
const ethApiKey = process.env.RINKEBY_API_KEY as string;
const daoTokenERC20 = process.env.DAO_TOKEN_ADDRESS as string;

type IEnvItem = { value: string | number | undefined; key: string };

const requiredEnvs: Array<IEnvItem> = [
  { value: ethApiKey, key: "RINKEBY_API_KEY" },
  { value: process.env.RINKEBY_CHAIN_URL, key: "RINKEBY_CHAIN_URL" },
  { value: process.env.RINKEBY_CHAIN_ID, key: "RINKEBY_CHAIN_ID" },
  { value: process.env.RINKEBY_PRIVATE_KEY, key: "RINKEBY_PRIVATE_KEY" },
  { value: daoTokenERC20, key: "DAO_TOKEN_ADDRESS" },
];

requiredEnvs.forEach((item: IEnvItem): void => {
  if (!item.value) {
    throw new Error(
      `Please check that the ${item.key} value exist in the .env file`
    );
  }
});

const getChainConfig = (chain: Chains): NetworkUserConfig => {
  const url = process.env[`${ChainEnv[chain]}_CHAIN_URL`] as string;
  const privateKey = process.env[`${ChainEnv[chain]}_PRIVATE_KEY`] as string;
  const chainId = Number(process.env[`${ChainEnv[chain]}_CHAIN_ID`]);
  return {
    url,
    accounts: [privateKey],
    chainId,
  };
};

const config: IConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    [Chains.RINKEBY as string]: getChainConfig(Chains.RINKEBY),
    [Chains.BSC_TEST as string]: getChainConfig(Chains.BSC_TEST),
  },
  gasReporter: {
    enabled: reportGas,
    currency: "USD",
    src: "./contracts",
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },

  etherscan: {
    apiKey: ethApiKey,
  },
  mocha: {
    timeout: 500000,
  },
};

export default config;

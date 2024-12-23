require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-gas-reporter");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1.2
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      gasPrice: "auto",
      gas: "auto",
      gasMultiplier: 1.2,
      timeout: 60000
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      gasPrice: parseInt((process.env.GAS_PRICE_MULTIPLIER || 1.1) * 1e9),
      gas: parseInt(process.env.MAX_GAS_LIMIT || 6000000),
      gasMultiplier: 1.2,
      timeout: 60000
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test/contracts",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: 'gas-report.txt',
    noColors: true,
    excludeContracts: ['Migrations']
  }
}; 
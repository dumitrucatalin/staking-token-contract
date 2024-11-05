require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

const { testnetPrivateKey } = require("./config.secret.js");

module.exports = {
  solidity: "0.8.22",
  defaultNetwork: "hardhat",
  paths: {
    sources: "./src/contracts",
    tests: "./src/tests",
  },
  networks: {
    hardhat: {},
    local: {
      url: "http://0.0.0.0:8545",
    },
    sepolia: {
      url: "https://sepolia.gateway.tenderly.co",
      chainId: 11155111,
      accounts: [testnetPrivateKey],
    },
  },
};

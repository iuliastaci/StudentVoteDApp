require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      gas: "auto",
      mining: {
        auto: false,
        interval: 2000, //ms
      }
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/51bcc2f04d7d4dd5ba8cb848b5b56c35",
      accounts: ["8b27874f3d782afc8da26cebcf4bdcd245962dcac057d155b71458f1a41222fa"]
    }
  },
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: "FQPRTM4QSE5ZE4IE3EBDYTYNB6JRFG366X"
  }
};

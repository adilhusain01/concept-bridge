// hardhat.config.js
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.27",
  networks: {
    mantle: {
      url: process.env.MANTLE_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

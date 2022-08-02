// function deployFunc() {
//   console.log("hi");
// }

const { networks } = require("../hardhat.config");

// module.exports.default = deployFunc();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
};

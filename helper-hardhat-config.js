const networkConfig = {
  4: {
    name: "rinkeby",
    ethUsdPriceFeed: "0x78F9e60608bF48a1155b4B2A5e31F32318a1d85F",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};

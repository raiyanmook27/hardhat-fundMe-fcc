const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let deployer;
      const sendValue = ethers.utils.parseEther("1.0");
      beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        //deploy all contracts
        await deployments.fixture(["all"]);
        //call that deployer for the contract
        const myfundMe = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt(
          myfundMe.abi,
          myfundMe.address,
          deployer
        );
      });

      it("allows people to fund and withdraw", async function () {
        await fundMe.fundMe({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });

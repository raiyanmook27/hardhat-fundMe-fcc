const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1.0");
      //deploy contract
      beforeEach(async function () {
        //deploy fundMe contract
        //using hardhat-deploy
        //get specific account
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
        const myAggr = await deployments.get("MockV3Aggregator");
        //get aggregator
        mockV3Aggregator = await ethers.getContractAt(
          myAggr.abi,
          myAggr.address,
          deployer
        );
      });
      describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async function () {
        it("Fails if you dont send enough eth", async function () {
          await expect(fundMe.fundMe()).to.be.revertedWith(
            // error has to be same as contract
            "You need to spend more ETH!"
          );
        });
        it("updated the amount funded data structure", async function () {
          await fundMe.fundMe({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(
            deployer.address
          );
          assert.equal(response.toString(), sendValue.toString());
        });
        it("Adds funder to funders array", async function () {
          await fundMe.fundMe({ value: sendValue });
          const funder = await fundMe.getFunders(0);
          assert.equal(funder, deployer.address);
        });
      });

      describe("withdraw", async function () {
        //check there is ethers
        beforeEach(async function () {
          await fundMe.fundMe({ value: sendValue });
        });

        it("withdraw ETH from a single funder", async function () {
          //arrange
          //contract balance
          const startFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          //deployer balance
          const startDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          );
          //act
          const transResponse = await fundMe.withdraw();
          const transactReceipt = await transResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          );
          //assert

          assert.equal(endFundBalance, 0);
          assert.equal(
            startFundBalance.add(startDeployerBalance).toString(),
            endDeployerBalance.add(gasCost).toString()
          );
        });
        it("allows us to withdraw with multiple funders", async function () {
          //arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fundMe({ value: sendValue });
          }
          const startFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          //deployer balance
          const startDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          );

          //act
          const transResponse = await fundMe.withdraw();
          const transactReceipt = await transResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          );
          assert.equal(endFundBalance, 0);
          assert.equal(
            startFundBalance.add(startDeployerBalance).toString(),
            endDeployerBalance.add(gasCost).toString()
          );

          //make sure getFunders array are reset
          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it("only allow the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          //connect attacker to contract
          const attackerConnectedContract = await fundMe.connect(accounts[1]);
          await expect(attackerConnectedContract.withdraw()).to.be.reverted;
        });

        it("cheaperWithdraw Testing", async function () {
          //arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fundMe({ value: sendValue });
          }
          const startFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          //deployer balance
          const startDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          );

          //act
          const transResponse = await fundMe.cheaperWithdraw();
          const transactReceipt = await transResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endDeployerBalance = await fundMe.provider.getBalance(
            deployer.address
          );
          assert.equal(endFundBalance, 0);
          assert.equal(
            startFundBalance.add(startDeployerBalance).toString(),
            endDeployerBalance.add(gasCost).toString()
          );

          //make sure getFunders array are reset
          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
      });
    });

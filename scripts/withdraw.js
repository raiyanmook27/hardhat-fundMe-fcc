const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();
  deployer = accounts[0];
  //deploy all contracts
  await deployments.fixture(["all"]);
  //call that deployer for the contract
  const myfundMe = await deployments.get("FundMe");
  const fundMe = await ethers.getContractAt(
    myfundMe.abi,
    myfundMe.address,
    deployer
  );
  console.log("Withdrawing Funds......");
  const transactionRes = await fundMe.withdraw();
  await transactionRes.wait(1);
  console.log("Funds withdrew!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

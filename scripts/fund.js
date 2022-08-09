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
  console.log("Funding Contract......");
  const transactionRes = await fundMe.fundMe({
    value: ethers.utils.parseEther("0.1"),
  });
  await transactionRes.wait(1);
  console.log("Funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

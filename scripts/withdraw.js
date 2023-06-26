const {ethers, getNamedAccounts}=require("hardhat");

async function main(){
    const {deployer}=await getNamedAccounts();
    await deployments.fixture(["all"]);
    const deployedContractAddress = (await deployments.get("FundMe")).address;
    const signer = await ethers.getSigner(deployer);
    const fundMe=await ethers.getContractAt("FundMe",deployedContractAddress,signer);
    console.log("funding..");
    const transactionResponse=await fundMe.withdraw();
    await transactionResponse.wait(1);
    console.log("funded");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
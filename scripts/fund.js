const {ethers, getNamedAccounts}=require("hardhat");

async function main(){
    const deployer=(await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    const deployedContractAddress = (await deployments.get("FundMe")).address;
    const signer = await ethers.getSigner(deployer);
    const fundMe=await ethers.getContractAt("FundMe",deployedContractAddress,signer);
    console.log("deploying..");
    const transactionResponse=await fundMe.fund({value:"100000000000000000"});
    await transactionResponse.wait(1);
    console.log("deployed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
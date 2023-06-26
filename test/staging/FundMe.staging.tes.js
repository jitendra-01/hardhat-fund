const { assert,expect } = require("chai");
const {deployments, ethers, getNamedAccounts, network}=require("hardhat");
const {developmentChain}=require("../../helper-hardhat-config");

developmentChain.includes(network.name)
    ?describe.skip
    :describe("FundMe",function(){
        let fundMe;
        let deployer ;
        let deployedContractAddress;
        const sendValue="100000000000000000";
        beforeEach(async ()=>{
            deployer=(await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            deployedContractAddress = (await deployments.get("FundMe")).address;
            const signer = await ethers.getSigner(deployer);
            fundMe=await ethers.getContractAt("FundMe",deployedContractAddress,signer);
        })

        it("allows people to fund and withdraw", async function () {
            const fundTxResponse = await fundMe.fund({ value: sendValue })
            await fundTxResponse.wait(1)
            const withdrawTxResponse = await fundMe.withdraw()
            await withdrawTxResponse.wait(1)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            console.log(
                endingFundMeBalance.toString() +
                    " should equal 0, running assert equal..."
            )
            assert.equal(endingFundMeBalance.toString(), "0")
        })
    })
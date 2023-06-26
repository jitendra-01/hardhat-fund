const { assert,expect } = require("chai");
const {deployments, ethers, getNamedAccounts}=require("hardhat");
const {developmentChain}=require("../../helper-hardhat-config");

!developmentChain.includes(network.name)
    ?describe.skip:
describe("FundMe",function(){
    let fundMe;
    let deployer ;
    let MockV3Aggregator;
    let deployedContractAddress;
    let deployedContractAddressMock;
    const sendValue="100000000000000000";
    // const sendValue = ethers.utils.parseEther("1")
    beforeEach(async ()=>{
        deployer=(await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        deployedContractAddress = (await deployments.get("FundMe")).address;
        const signer = await ethers.getSigner(deployer);
        deployedContractAddressMock=(await deployments.get("MockV3Aggregator")).address;
        // console.log(deployedContractAddressMock);
        fundMe=await ethers.getContractAt("FundMe",deployedContractAddress,signer);
        MockV3Aggregator=await ethers.getContractAt("MockV3Aggregator",deployedContractAddressMock,signer);
    })
    describe("constructor",function(){
        it("sets aggregator address",async ()=>{
            const response=await fundMe.gets_priceFeed();
            // console.log(response);
            expect(response).to.equal(MockV3Aggregator.target);
        })
    }) 
    describe("fund",async function(){
        it("fails if not send enough eth",async function(){
            await expect(fundMe.fund()).to.be.reverted;
        })
        it("updated amount",async function(){
            await fundMe.fund({value:sendValue});
            const response=await fundMe.getAddressToAmountFunded(deployer);
            assert.equal(response.toString(),sendValue.toString());
        })
        it("add funder",async function(){
            await fundMe.fund({value:sendValue});
            const funder=await fundMe.getFunder(0);
            assert.equal(funder,deployer);
        })
    })

    describe("withdraw",async function(){
        beforeEach(async function(){
            await fundMe.fund({value:sendValue});
        })
        it("withdraw eth",async function(){
            // arrange
            const startingFundMeBalance=await ethers.provider.getBalance(fundMe.target);
            const startingDeployerBalance=await ethers.provider.getBalance(deployer);
            // act
            const transactionResponse=await fundMe.withdraw();
            const transactionReceipt=await transactionResponse.wait(1);

            const{gasUsed,gasPrice}=transactionReceipt;
            const gasCost=((gasPrice)*(gasUsed));

            const endingFundMeBalance=await ethers.provider.getBalance(fundMe.target);
            const endingDeployerBalance=await ethers.provider.getBalance(deployer);
            
            // Assert
            assert.equal(endingFundMeBalance,0);
            assert.equal((startingFundMeBalance)+(startingDeployerBalance),
                        (endingDeployerBalance)+(gasCost));
        })

        it("allows to withdraw multiple funders",async function(){
            const account=await ethers.getSigners();
            for(let i=1;i<6;i++){
                const fundMeConectedContract=await fundMe.connect(
                    account[i]
                )
                await fundMeConectedContract.fund({value:sendValue});
            }

            const startingFundMeBalance=await ethers.provider.getBalance(fundMe.target);
            const startingDeployerBalance=await ethers.provider.getBalance(deployer);

            const transactionResponse=await fundMe.withdraw();
            const transactionReceipt=await transactionResponse.wait(1);

            const{gasUsed,gasPrice}=transactionReceipt;
            const gasCost=((gasPrice)*(gasUsed));

            const endingFundMeBalance=await ethers.provider.getBalance(fundMe.target);
            const endingDeployerBalance=await ethers.provider.getBalance(deployer);
            
            // Assert
            assert.equal(endingFundMeBalance,0);
            assert.equal((startingFundMeBalance)+(startingDeployerBalance),
                        (endingDeployerBalance)+(gasCost));
            
            await expect(fundMe.getFunder(0)).to.be.reverted;

            for(i=1;i<6;i++){
                assert.equal(await fundMe.getAddressToAmountFunded(account[i].address),0);
            }
        })

        it("only owner withdraw",async function(){
            const accounts=await ethers.getSigners();
            const attackersConnected=await fundMe.connect(accounts[1]);
            await expect(attackersConnected.withdraw()).to.be.revertedWithCustomError(fundMe,"FundMe_NotOwner");
        })

        it("cheaper withdraw",async function(){
            const account=await ethers.getSigners();
            for(let i=1;i<6;i++){
                const fundMeConectedContract=await fundMe.connect(
                    account[i]
                )
                await fundMeConectedContract.fund({value:sendValue});
            }

            const startingFundMeBalance=await ethers.provider.getBalance(fundMe.target);
            const startingDeployerBalance=await ethers.provider.getBalance(deployer);

            const transactionResponse=await fundMe.cheaperWithdraw();
            const transactionReceipt=await transactionResponse.wait(1);

            const{gasUsed,gasPrice}=transactionReceipt;
            const gasCost=((gasPrice)*(gasUsed));

            const endingFundMeBalance=await ethers.provider.getBalance(fundMe.target);
            const endingDeployerBalance=await ethers.provider.getBalance(deployer);
            
            // Assert
            assert.equal(endingFundMeBalance,0);
            assert.equal((startingFundMeBalance)+(startingDeployerBalance),
                        (endingDeployerBalance)+(gasCost));
            
            await expect(fundMe.getFunder(0)).to.be.reverted;

            for(i=1;i<6;i++){
                assert.equal(await fundMe.getAddressToAmountFunded(account[i].address),0);
            }
        })
    })
})
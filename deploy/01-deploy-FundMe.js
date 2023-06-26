const {networkConfig, developmentChain}=require("../helper-hardhat-config");
const {network}=require("hardhat");
const {verify}=require("../utils/verify");
require("dotenv").config();

module.exports=async({getNmaedAccounts,deployments})=>{
    const{deploy,log,get}=deployments;
    const{deployer}=await getNamedAccounts();
    const chainId=network.config.chainId;

    let ethUsdPriceFeedAddress;
    if(developmentChain.includes(network.name)){
        const ethUsdAggregator=await get("MockV3Aggregator");
        ethUsdPriceFeedAddress=ethUsdAggregator.address;
    }
    else{
        ethUsdPriceFeedAddress=networkConfig[chainId]["ethUsdPriceFeed"];
    }
    
    const args =[ethUsdPriceFeedAddress];

    const fundMe =await deploy("FundMe",{
        from:deployer,
        args:args,
        log: true,
        waitConfirmations:network.config.blockConfirmations ||1,
    })
    if(!developmentChain.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(fundMe.address,args)
    }
}

module.exports.tags=["all","fundMe"]
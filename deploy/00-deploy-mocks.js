const {network}=require("hardhat");
const {developmentChain,decimal,initial_Answer}=require("../helper-hardhat-config");

module.exports=async({getNmaedAccounts,deployments})=>{
    const{deploy,log}=deployments;
    const{deployer}=await getNamedAccounts();
    // const chainId=network.config.chainId;

    if(developmentChain.includes(network.name)){
        log("local network");
        await deploy("MockV3Aggregator",{
            contract:"MockV3Aggregator",
            from: deployer,
            log: true,
            args: [decimal,initial_Answer],
        })
        log("mocks depoloyed.......")
    }
}

module.exports.tags=["all","mocks"]
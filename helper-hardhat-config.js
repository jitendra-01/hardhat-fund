const networkConfig={
    11155111:{
        name:"sepolia",
        ethUsdPriceFeed:"0x694AA1769357215DE4FAC081bf1f309aDC325306",
    }
}

const developmentChain=["hardhat","localhost"];
const decimal=8;
const initial_Answer=200000000000;

module.exports={
    networkConfig,
    developmentChain,
    decimal,
    initial_Answer,
}
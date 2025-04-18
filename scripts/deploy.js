const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Get the contract factory for the 'theatre' contract
    const Theatre = await ethers.getContractFactory("theatre");

    // Deploy the contract
    const theatre = await Theatre.deploy();

    console.log("Theatre contract deployed to:", theatre.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


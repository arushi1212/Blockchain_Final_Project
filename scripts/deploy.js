const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const Token = await hre.ethers.getContractFactory("MyToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  console.log("Token deployed to:", token.target);

  const MovieTicket = await hre.ethers.getContractFactory("MovieTicket");
  const movieTicket = await MovieTicket.deploy(token.target);
  await movieTicket.waitForDeployment();

  console.log("MovieTicket deployed to:", movieTicket.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

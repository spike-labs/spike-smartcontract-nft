// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const helper = require("./helper");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const networkName = hre.network.name
  console.log("networkName: ", networkName)

  let baseNFTAddress
  if (networkName == "hardhat") {
    const mockNFTFactory = await hre.ethers.getContractFactory("MockNFT")
    const mockNFTInstance = await mockNFTFactory.deploy("MockNFT", "MockNFT")
    await mockNFTInstance.deployed();
    baseNFTAddress = mockNFTInstance.address;
  }
  if (networkName == "rinkeby") {
    baseNFTAddress = "0xb74bf94049d2c01f8805b8b15db0909168cabf46"
  }
  await helper.deploy(networkName, baseNFTAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

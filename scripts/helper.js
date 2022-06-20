const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { time } = require("console");
const mkdirp = require('mkdirp');

const deploy = async (network, baseNFTAddress) => {
    const timestamp = Date.now();
    const location = path.join(__dirname, `/${network}/deployment.${timestamp}.json`);
    let deployments = {};

    // We get the contract to deploy
    const MetaverseNFT = await hre.ethers.getContractFactory("MetaverseNFT");
    const metaverseNFT = await MetaverseNFT.deploy("Azuki for Metaverse", "AzukiM", baseNFTAddress);
    await metaverseNFT.deployed();

    deployments.BaseNFT = baseNFTAddress;
    deployments.MetaverseNFT = metaverseNFT.address;
    console.log("MetaverseNFT deployed to:", metaverseNFT.address);
    await writeFile(location, JSON.stringify(deployments, null, 4));
}

const writeFile = async (location, content) => {
    await mkdirp(path.dirname(location));
    fs.writeFileSync(location, content);
};

module.exports = {
    deploy:deploy
}
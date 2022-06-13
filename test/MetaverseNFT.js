const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetaverseNFT", function () {
    let mockNFT;
    let metaverseNFT;
    let owner;
    before(async function () {
      [owner] = await ethers.getSigners();
      console.log("owner: ", owner.address);
      let mockNFTFactory = await ethers.getContractFactory("MockNFT");
      mockNFT = await mockNFTFactory.deploy("MockNFT", "MockNFT");
      await mockNFT.batchMint(5);

      let metaverseNFTFactory = await ethers.getContractFactory("MetaverseNFT");
      metaverseNFT = await metaverseNFTFactory.deploy("MockNFT for Metaverse", "MockM", mockNFT.address);

    });
    
    it("Should mint properly with existing id", async function () {
      await metaverseNFT.mint(1);
      let user = await metaverseNFT.ownerOf(1);
      expect(owner.address).to.equal(user);
    });

    it("Should properly set token uri", async function () {
      await metaverseNFT.mint(2);
      await metaverseNFT.setBaseTokenURI("https://BaseTokenURI/");
      let tokenUri = await metaverseNFT.tokenURI(2);
      expect(tokenUri).to.equal("https://BaseTokenURI/2");

      await metaverseNFT.setTokenURI(2, "https://TokenURI/2");
      tokenUri = await metaverseNFT.tokenURI(2);
      expect(tokenUri).to.equal("https://TokenURI/2");
    });


  });
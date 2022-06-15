const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetaverseNFT", function () {
  let mockNFT;
  let metaverseNFT;
  let owner;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  before(async function () {
    [owner] = await ethers.getSigners();
    console.log("owner: ", owner.address);
    const mockNFTFactory = await ethers.getContractFactory("MockNFT");
    mockNFT = await mockNFTFactory.deploy("MockNFT", "MockNFT");
    await mockNFT.batchMint(5);

    const metaverseNFTFactory = await ethers.getContractFactory("MetaverseNFT");
    metaverseNFT = await metaverseNFTFactory.deploy(
      "MockNFT for Metaverse",
      "MockM",
      mockNFT.address
    );
  });

  it("Should mint properly with existing id", async function () {
    await metaverseNFT.flipSaleState();
    await metaverseNFT.mint(1);
    const user = await metaverseNFT.ownerOf(1);
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

  it("Should batchMint properly with existing id", async function () {
    const tokenIds = [3, 4];
    await metaverseNFT.batchMint(owner.address, tokenIds);
    for (let i = 3; i < tokenIds.length; i++) {
      const user = await metaverseNFT.ownerOf(i);
      expect(owner.address).to.equal(user);
    }
  });
  // withdraw
  it("Should withdraw properly with existing address", async function () {
    // todo At present, there is no paid contract, and the withdrawal contract cannot be tested.
    // const beforeBalance = owner.address;
    // await metaverseNFT.withdraw();
    // expect(owner.balance).to.lessThanOrEqual(beforeBalance);
  });
  // flipSaleState
  it("So that SaleState is correctly modified", async function () {
    const saleState = await metaverseNFT.getSaleState();
    await metaverseNFT.flipSaleState();
    expect(await metaverseNFT.getSaleState()).to.equal(!saleState);
  });
  // setBasePrice
  it("So that BasePrice is correctly modified", async function () {
    await metaverseNFT.setBasePrice(1);
    expect(await metaverseNFT.getBasePrice()).to.equal(1);
  });
  // setFundManager
  it("So that FundManager is correctly modified", async function () {
    await metaverseNFT.setFundManager(owner.address);
    expect(await metaverseNFT.getFundManager()).to.equal(owner.address);
  });

  describe("Event test", function () {
    it("owner emit test", async () => {
      await metaverseNFT.setFundManager(zeroAddress);
      await expect(metaverseNFT.setFundManager(owner.address))
        .to.be.emit(metaverseNFT, "FundManagerChanged")
        .withArgs(zeroAddress, owner.address);
    });
  });
});

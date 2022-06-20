const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetaverseNFT", function () {
  let mockNFT;
  let metaverseNFT;
  let owner, addr1;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  before(async function () {
    [owner, addr1] = await ethers.getSigners();
    console.log("owner: ", owner.address);
    const mockNFTFactory = await ethers.getContractFactory("MockNFT");
    mockNFT = await mockNFTFactory.deploy("MockNFT", "MockNFT");
    await mockNFT.batchMint(6);

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
    await metaverseNFT.setBasePrice(ethers.utils.parseEther("1.0"));
    await metaverseNFT.setFundManager(owner.address);
    await metaverseNFT.mint(5, {
      value: ethers.utils.parseEther("1.0"),
    });
    console.log(
      "before withdraw contract balance: ",
      await metaverseNFT.provider.getBalance(metaverseNFT.address)
    );
    await expect(await metaverseNFT.withdraw()).to.changeEtherBalance(
      owner,
      ethers.utils.parseEther("1.0")
    );
    console.log(
      "after withdraw contract balance: ",
      await metaverseNFT.provider.getBalance(metaverseNFT.address)
    );
  });
  // flipSaleState
  it("So that SaleState is correctly modified", async function () {
    const saleState = await metaverseNFT.saleIsActive();
    await metaverseNFT.flipSaleState();
    expect(await metaverseNFT.saleIsActive()).to.equal(!saleState);
  });
  // setBasePrice
  it("So that BasePrice is correctly modified", async function () {
    await metaverseNFT.setBasePrice(1);
    expect(await metaverseNFT.basePrice()).to.equal(1);
  });
  // setFundManager
  it("So that FundManager is correctly modified", async function () {
    await metaverseNFT.setFundManager(owner.address);
    expect(await metaverseNFT.fundManager()).to.equal(owner.address);
  });
  // Royalty
  it("Is the  royalty designed correctly?", async function () {
    await metaverseNFT.setDefaultRoyalty(owner.address, 1);
    let returnValues = await metaverseNFT.royaltyInfo(4, 10);
    expect(owner.address).to.equal(await returnValues[0]);

    await metaverseNFT.setTokenRoyalty(1, addr1.address, 1);
    returnValues = await metaverseNFT.royaltyInfo(1, 10);
    expect(addr1.address).to.equal(await returnValues[0]);
  });

  describe("Event test", function () {
    it("owner emit test", async () => {
      await metaverseNFT.setFundManager(zeroAddress);
      await expect(metaverseNFT.setFundManager(owner.address))
        .to.emit(metaverseNFT, "FundManagerChanged")
        .withArgs(zeroAddress, owner.address);
    });
  });
});

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Allow user to mint one metaverse version of NFT for each associated base NFT.
 */
contract MetaverseNFT is ERC721, ERC2981, Ownable {
    // Used to construct tokenURI together with token id
    string private _baseTokenURI;
    // The original NFT which the metaverse NFT will be minted on
    IERC721 public baseNFT;
    // Allow to mint when the value is true
    bool public saleIsActive = false;
    // The eth required to mint one NFT
    uint256 public basePrice;
    // The account has permission to withdraw user paid eth
    address public fundManager;

    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    event RolledOver(bool status);
    event PriceChanged(uint256 oldPrice, uint256 newPrice);
    event FundManagerChanged(address oldFundManager, address newFundManager);

    constructor(string memory name, string memory symbol, IERC721 _baseNFT) ERC721(name, symbol) {
        baseNFT = _baseNFT;
        fundManager = msg.sender;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function mint(uint256 tokenId) external payable {
        require(msg.value == basePrice, "Invalid payment");

        mintInternal(msg.sender, tokenId);
    }

    function batchMint(address to, uint256[] memory tokenIds) external payable {
        require(msg.value == basePrice * tokenIds.length, "Invalid payment");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            mintInternal(to, tokenIds[i]);
        }
    }

    function mintInternal(address to, uint256 tokenId) internal {
        require(saleIsActive, "Sale is not active");
        require(baseNFT.ownerOf(tokenId) == to, "Mint for invalid tokenId");
        require(!_exists(tokenId), "Already minted");

        _safeMint(to, tokenId);
    }
    
    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];

        // If there is no base URI, return the token URI.
        if (bytes(_tokenURI).length > 0) {
            return _tokenURI;
        }

        return super.tokenURI(tokenId);
    }

    function withdraw() external {
        require(msg.sender == fundManager, "Invalid fund manager");

        uint balance = address(this).balance;
        Address.sendValue(payable(msg.sender), balance);
    }

    function flipSaleState() external onlyOwner {
        saleIsActive = !saleIsActive;
        emit RolledOver(saleIsActive);
    }

    function setBasePrice(uint256 newBasePrice) external onlyOwner {
        emit PriceChanged(basePrice, newBasePrice);

        basePrice = newBasePrice;
    }

    function setFundManager(address newFundManager) external onlyOwner {
        emit FundManagerChanged(fundManager, newFundManager);

        fundManager = newFundManager;
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        super._setDefaultRoyalty(receiver, feeNumerator);
    }

    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external onlyOwner {
        super._setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }

    function setBaseTokenURI(string memory baseURI_) external onlyOwner {
         _baseTokenURI = baseURI_;
    }

    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function getFundManager() public view  returns (address){
        return fundManager;
    }

    function getBasePrice() public view  returns (uint256){
        return basePrice;
    }

    function getSaleState() public view  returns (bool){
        return saleIsActive;
    }
}

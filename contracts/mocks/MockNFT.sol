// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "../MetaverseNFT.sol";

contract MockNFT is ERC721PresetMinterPauserAutoId {
    constructor(string memory name, string memory symbol) ERC721PresetMinterPauserAutoId(name, symbol, "") {
    }

    function batchMint(uint256 quantity) external {
        for (uint256 i = 0; i < quantity; i++) {
            super.mint(msg.sender);
        }
    }


}

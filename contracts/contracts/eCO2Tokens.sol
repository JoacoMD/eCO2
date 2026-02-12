// contracts/eCO2Tokens.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract eCO2Tokens is ERC1155 {

    uint256 public LAST_TOKEN_ID = 0;
    address public eco2Contract;
    address public owner;
    mapping(uint256 => string) public tokenURIs;

    constructor() ERC1155("https://game.example/api/item/{id}.json") {
        owner = msg.sender;
    }

    function setEco2Contract(address _eco2Contract) public {
        require(msg.sender == owner, "Only owner can set eCO2 contract address");
        eco2Contract = _eco2Contract;
    }

    function mint(address to, uint256 amount) public returns (uint256) {
        LAST_TOKEN_ID += 1;
        uint256 newTokenId = LAST_TOKEN_ID;
        _mint(to, newTokenId, amount, "");
        tokenURIs[newTokenId] = uri(newTokenId);
        _setApprovalForAll(to, eco2Contract, true);
        return newTokenId;
    }

    function burn(address from, uint256 tokenId, uint256 amount) public {
        _burn(from, tokenId, amount);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount) public {
        _safeTransferFrom(from, to, tokenId, amount, "");
    }
}
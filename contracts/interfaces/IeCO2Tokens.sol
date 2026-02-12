// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IeCO2Tokens {
    function mint(address to, uint256 amount) external returns (uint256);
    function burn(address from, uint256 tokenId, uint256 amount) external;
    function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount) external;
    function balanceOf(address account, uint256 tokenId) external view returns (uint256);
    function balanceOfBatch(address[] memory accounts, uint256[] memory tokenIds) external view returns (uint256[] memory);
}
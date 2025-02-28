// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MysteryBox {
    address public owner;
    IERC20 public usdt;
    uint256 public boxPrice = 3 * 10**6; // 3 USDT (6 décimales)
    uint256 public constant MAX_CHARACTERS = 7;

    event BoxPurchased(address buyer, uint256 characterId);

    constructor(address _usdtAddress) {
        owner = msg.sender;
        usdt = IERC20(_usdtAddress); // Adresse USDT sur Base
    }

    // Achat avec USDT
    function buyBox() external {
        require(usdt.transferFrom(msg.sender, address(this), boxPrice), "Payment failed");
        uint256 characterId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % MAX_CHARACTERS;
        emit BoxPurchased(msg.sender, characterId);
    }

    // Achat avec ETH (pour tests sur testnet)
    function buyBoxWithEth() external payable {
        require(msg.value >= 0.001 ether, "Send at least 0.001 ETH"); // Prix fictif pour test
        uint256 characterId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % MAX_CHARACTERS;
        emit BoxPurchased(msg.sender, characterId);
    }

    // Retirer les fonds (USDT ou ETH)
    function withdraw() external {
        require(msg.sender == owner, "Owner only");
        uint256 usdtBalance = usdt.balanceOf(address(this));
        if (usdtBalance > 0) {
            usdt.transfer(owner, usdtBalance);
        }
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            payable(owner).transfer(ethBalance);
        }
    }
}
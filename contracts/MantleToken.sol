// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MantleToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("MantleToken", "MNT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }

    function distributeReward(address to) external onlyOwner {
        _transfer(owner(), to, 1);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RewardDistribution is Ownable {
    mapping(address => uint256) public deposits;
    
    uint256 public totalRewards;

    event Deposited(address indexed depositor, uint256 amount);
    
    event RewardDistributed(address indexed recipient, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        deposits[msg.sender] += msg.value;
        totalRewards += msg.value;

        emit Deposited(msg.sender, msg.value);
    }


function distributeReward(address recipient, uint256 amountInEther) external onlyOwner {
    uint256 amount = amountInEther * 10**18;

    require(recipient != address(0), "Invalid recipient address");
    require(amount > 0, "Distribution amount must be greater than 0");
    require(amount <= address(this).balance, "Insufficient contract balance");

    (bool success, ) = payable(recipient).call{value: amount}("");
    require(success, "Reward transfer failed");

    totalRewards -= amount;

    emit RewardDistributed(recipient, amount);
}

    function withdrawRemaining() external onlyOwner {
        uint256 remainingBalance = address(this).balance;
        require(remainingBalance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: remainingBalance}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {
        deposits[msg.sender] += msg.value;
        totalRewards += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
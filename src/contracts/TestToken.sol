// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract TestToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    mapping(address => uint256) public mintedAmounts;
    uint256 public MAX_MINT_AMOUNT;

    constructor(address initialOwner)
        ERC20("TestToken", "TST")
        Ownable(initialOwner)
        ERC20Permit("TestToken")
    {
        _mint(msg.sender, 100000 * 10 ** decimals());
        MAX_MINT_AMOUNT = 100 * 10 ** decimals(); // Set max mint amount in the constructor
    }

    function mint(uint256 amount) public {
        if (msg.sender != owner()) {
            require(amount <= MAX_MINT_AMOUNT, "Cannot mint more than 100 tokens at a time");
            require(
                mintedAmounts[msg.sender] + amount <= MAX_MINT_AMOUNT,
                "Minting limit exceeded"
            );
            mintedAmounts[msg.sender] += amount;
        }
        
        _mint(msg.sender, amount);
    }
}
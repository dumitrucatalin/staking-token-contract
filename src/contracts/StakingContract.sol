// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingContract is Ownable {
    IERC20 public stakingToken;
    uint256 public constant MAX_LOCK_PERIOD = 365 days;

    struct Stake {
        uint256 amount;
        uint256 unlockTime;
    }

    // Update mapping to allow multiple stakes per user
    mapping(address => Stake[]) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 unlockTime);
    event Unstaked(address indexed user, uint256 amount);

    constructor(IERC20 _stakingToken) Ownable(msg.sender) {
        stakingToken = _stakingToken;
    }

    function stake(uint256 amount, uint256 lockPeriod) external {
        require(amount > 0, "Cannot stake 0 tokens");
        require(lockPeriod > 0 && lockPeriod <= MAX_LOCK_PERIOD, "Invalid lock period");

        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        stakes[msg.sender].push(Stake({
            amount: amount,
            unlockTime: block.timestamp + lockPeriod
        }));

        emit Staked(msg.sender, amount, block.timestamp + lockPeriod);
    }

    function unstake(uint256 index) external {
        require(index < stakes[msg.sender].length, "Invalid stake index");
        Stake storage userStake = stakes[msg.sender][index];
        require(block.timestamp >= userStake.unlockTime, "Stake is still locked");
        require(userStake.amount > 0, "No tokens staked");

        uint256 amount = userStake.amount;
        userStake.amount = 0;  // Mark as unstaked

        require(stakingToken.transfer(msg.sender, amount), "Token transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    function getStakes(address user) external view returns (Stake[] memory) {
        return stakes[user];
    }
}
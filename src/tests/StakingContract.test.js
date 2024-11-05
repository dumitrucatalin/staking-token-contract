const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingContract", function () {
  let TestToken, testToken, StakingContract, stakingContract, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy TestToken
    TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy(owner.address);
    await testToken.deployed();

    // Deploy StakingContract
    StakingContract = await ethers.getContractFactory("StakingContract");
    stakingContract = await StakingContract.deploy(testToken.address);
    await stakingContract.deployed();

    // Approve StakingContract to transfer tokens on behalf of addr1
    await testToken.transfer(addr1.address, ethers.utils.parseUnits("100", 18));
    await testToken
      .connect(addr1)
      .approve(stakingContract.address, ethers.utils.parseUnits("100", 18));
  });

  it("Should allow staking tokens", async function () {
    const stakeAmount = ethers.utils.parseUnits("10", 18);
    const lockPeriod = 30 * 24 * 60 * 60; // 30 days

    await stakingContract.connect(addr1).stake(stakeAmount, lockPeriod);
    const stakes = await stakingContract.getStakes(addr1.address);
    expect(stakes[0].amount).to.equal(stakeAmount);
  });

  it("Should prevent unstaking before the lock period", async function () {
    const stakeAmount = ethers.utils.parseUnits("10", 18);
    const lockPeriod = 30 * 24 * 60 * 60;

    await stakingContract.connect(addr1).stake(stakeAmount, lockPeriod);
    await expect(stakingContract.connect(addr1).unstake(0)).to.be.revertedWith(
      "Stake is still locked",
    );
  });

  it("Should allow unstaking after the lock period", async function () {
    const stakeAmount = ethers.utils.parseUnits("10", 18);
    const lockPeriod = 30 * 24 * 60 * 60;

    await stakingContract.connect(addr1).stake(stakeAmount, lockPeriod);

    // Fast-forward time
    await ethers.provider.send("evm_increaseTime", [lockPeriod]);
    await ethers.provider.send("evm_mine", []);

    await stakingContract.connect(addr1).unstake(0);
    const stakes = await stakingContract.getStakes(addr1.address);
    expect(stakes[0].amount).to.equal(0); // Amount should be set to 0 after unstaking
  });
});

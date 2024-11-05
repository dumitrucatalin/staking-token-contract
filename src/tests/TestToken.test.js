const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestToken", function () {
  let TestToken, testToken, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy(owner.address);
    await testToken.deployed();
  });

  it("Should deploy with initial supply to owner", async function () {
    const ownerBalance = await testToken.balanceOf(owner.address);
    expect(await testToken.totalSupply()).to.equal(ownerBalance);
  });

  it("Should allow owner to mint tokens", async function () {
    await testToken.mint(ethers.utils.parseUnits("50", 18));
    const ownerBalance = await testToken.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.utils.parseUnits("100050", 18)); // initial 100000 + 50
  });

  it("Should restrict non-owner from minting over MAX_MINT_AMOUNT", async function () {
    await expect(
      testToken.connect(addr1).mint(ethers.utils.parseUnits("200", 18)),
    ).to.be.revertedWith("Cannot mint more than 100 tokens at a time");
  });

  it("Should allow burning tokens", async function () {
    await testToken.burn(ethers.utils.parseUnits("1000", 18));
    const ownerBalance = await testToken.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.utils.parseUnits("99000", 18));
  });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CandidateRegistry Contract", function () {
  let CandidateRegistry, candidateRegistry, owner, addr1, addr2;

  beforeEach(async function () {
    CandidateRegistry = await ethers.getContractFactory("CandidateRegistry");
    [owner, addr1, addr2] = await ethers.getSigners();

    candidateRegistry = await CandidateRegistry.deploy();
    await candidateRegistry.waitForDeployment();
  });

  it("Should set the right owner", async function () {
    expect(await candidateRegistry.owner()).to.equal(owner.address);
  });

  it("Should allow owner to add a candidate", async function () {
    const tx = await candidateRegistry.addCandidate("Candidate 1");
    await tx.wait();
    const candidate = await candidateRegistry.getCandidate(0);
    expect(candidate[0]).to.equal("Candidate 1");
  });

  it("Should emit CandidateAdded event when a candidate is added", async function () {
    const tx = await candidateRegistry.addCandidate("Candidate 1");
    await tx.wait();
    await expect(tx)
      .to.emit(candidateRegistry, "CandidateAdded")
      .withArgs("Candidate 1");
  });

  it("Should not allow non-owner to add a candidate", async function () {
    await expect(
      candidateRegistry.connect(addr1).addCandidate("Candidate 2")
    ).to.be.revertedWith("Only the owner can perform this action.");
  });

  it("Should return the correct number of candidates", async function () {
    const tx1 = await candidateRegistry.addCandidate("Candidate 1");
    await tx1.wait();
    const tx2 = await candidateRegistry.addCandidate("Candidate 2");
    await tx2.wait();
    const candidatesCount = await candidateRegistry.getCandidatesCount();
    expect(candidatesCount).to.equal(2);
  });
});
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting, voting, CandidateRegistry, candidateRegistry, owner, addr1, addr2;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    CandidateRegistry = await ethers.getContractFactory("CandidateRegistry");
    [owner, addr1, addr2] = await ethers.getSigners();

    candidateRegistry = await CandidateRegistry.deploy();
    await candidateRegistry.waitForDeployment();

    voting = await Voting.deploy(86400, candidateRegistry.target); // Deploy cu durata votului de 1 zi și adresa contractului CandidateRegistry
    await voting.waitForDeployment();
  });

  it("Should allow voting for a candidate", async function () {
    const tx1 = await candidateRegistry.addCandidate("Candidate 1");
    await tx1.wait();

    const tx2 = await voting.connect(addr1).vote(0, { value: ethers.parseEther("0.01") });
    await tx2.wait();

    candidate = await candidateRegistry.getCandidate(0);
    expect(candidate[1]).to.equal(1);
  });

  it("Should prevent double voting", async function () {
    await candidateRegistry.addCandidate("Candidate 1");
    await voting.connect(addr1).vote(0, { value: ethers.parseEther("0.01") });
    await expect(
      voting.connect(addr1).vote(0, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWith("Already voted.");
  });

  it("Should estimate gas for a vote function", async function () {
    await candidateRegistry.addCandidate("Candidate 1");
    const tx = await voting.connect(addr1).vote(0, { value: ethers.parseEther("0.01") });
    const receipt = await tx.wait();
    console.log(`Gas Used for Voting: ${receipt.gasUsed.toString()}`);
  });
});
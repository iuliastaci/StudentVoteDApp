const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting, voting, CandidateRegistry, candidateRegistry, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    CandidateRegistry = await ethers.getContractFactory("CandidateRegistry");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    candidateRegistry = await CandidateRegistry.deploy();
    await candidateRegistry.waitForDeployment();

    voting = await Voting.deploy(86400, candidateRegistry.target); // Deploy cu durata votului de 1 zi și adresa contractului CandidateRegistry
    await voting.waitForDeployment();
  });

  it("Should allow voting for a candidate", async function () {
    const tx1 = await candidateRegistry.addCandidate("Candidate 1");
    await tx1.wait();

    const tx2 = await voting.connect(addr1).vote(0, { value: ethers.parseEther("0.00001") });
    await tx2.wait();

    candidate = await candidateRegistry.getCandidate(0);
    expect(candidate[1]).to.equal(1);
  });

  it("Should prevent double voting", async function () {
    await candidateRegistry.addCandidate("Candidate 1");
    await voting.connect(addr1).vote(0, { value: ethers.parseEther("0.00001") });
    await expect(
      voting.connect(addr1).vote(0, { value: ethers.parseEther("0.00001") })
    ).to.be.revertedWith("Already voted.");
  });

  it("Should estimate gas for a vote function", async function () {
    await candidateRegistry.addCandidate("Candidate 1");
    const tx = await voting.connect(addr1).vote(0, { value: ethers.parseEther("0.00001") });
    const receipt = await tx.wait();
    console.log(`Gas Used for Voting: ${receipt.gasUsed.toString()}`);
  });

  it("Should declare the winner correctly", async function () {
    const tx1 = await candidateRegistry.addCandidate("Candidate 1");
    await tx1.wait();
    const tx2 = await candidateRegistry.addCandidate("Candidate 2");
    await tx2.wait();

    const tx3 = await voting.connect(addr1).vote(0, { value: ethers.parseEther("0.00001") });
    await tx3.wait();
    const tx4 = await voting.connect(addr2).vote(1, { value: ethers.parseEther("0.00001") });
    await tx4.wait();
    const tx5 = await voting.connect(addr3).vote(1, { value: ethers.parseEther("0.00001") });
    await tx5.wait();

    // Grabim timpul cu 1 zi
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine");

    const tx6 = await voting.declareWinner();
    await tx6.wait();

    const winner = await voting.getWinner();
    expect(winner[0]).to.equal("Candidate 2");
    expect(winner[1]).to.equal(2);

    await expect(tx6).to.emit(voting, "WinnerDeclared").withArgs("Candidate 2", 2);
  });

  it("Should not allow declaring winner before voting period ends", async function () {
    const tx1 = await candidateRegistry.addCandidate("Candidate 1");
    await tx1.wait();
    const tx2 = await voting.connect(addr1).vote(0, { value: ethers.parseEther("0.00001") });
    await tx2.wait();

    await expect(voting.declareWinner()).to.be.revertedWith("Voting period is not over yet.");
  });
});
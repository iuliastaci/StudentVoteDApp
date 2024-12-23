
describe("Voting Contract", function () {
  let Voting, voting, owner, addr1, addr2;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2] = await ethers.getSigners();

    voting = await Voting.deploy();
  });

  it("Should allow owner to add a candidate", async function () {
    await voting.addCandidate("Candidate 1");
    const results = await voting.getResults();
    expect(results[0].name).to.equal("Candidate 1");
  });

  it("Should allow voting for a candidate", async function () {
    await voting.addCandidate("Candidate 1");
    await voting.connect(addr1).vote(0);
    const results = await voting.getResults();
    expect(results[0].voteCount).to.equal(1);
  });

  it("Should prevent double voting", async function () {
    await voting.addCandidate("Candidate 1");
    await voting.connect(addr1).vote(0);

    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith(
      "Already voted."
    );
  });
});

const hre = require("hardhat");

async function main() {
    // Deploy CandidateRegistry
    const CandidateRegistry = await hre.ethers.getContractFactory("CandidateRegistry");
    const candidateRegistry = await CandidateRegistry.deploy();

    await candidateRegistry.waitForDeployment();
    console.log("CandidateRegistry contract deployed to:", candidateRegistry.target);

    // Deploy Voting 
    const Voting = await hre.ethers.getContractFactory("Voting");
    const votingDuration = 60 * 60 * 24; // 1 day in seconds
    const voting = await Voting.deploy(votingDuration, candidateRegistry.target);

    await voting.waitForDeployment();
    console.log("Voting contract deployed to:", voting.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

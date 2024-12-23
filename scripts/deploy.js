const hre = require("hardhat");

async function main() {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const votingDuration = 60 * 60 * 24; // 1 day in seconds
    const voting = await Voting.deploy(votingDuration);

    await voting.waitForDeployment();
    console.log("Voting contract deployed to:", voting.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

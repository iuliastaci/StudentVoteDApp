import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CANDIDATE_CONTRACT_ADDRESS, CANDIDATE_ABI, VOTING_CONTRACT_ADDRESS, VOTING_ABI } from "./config.js";
import './App.css';

const App = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [candidateContract, setCandidateContract] = useState(null);
    const [votingContract, setVotingContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);
    const [votedCandidateIndex, setVotedCandidateIndex] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [newCandidate, setNewCandidate] = useState("");
    const [walletBalance, setWalletBalance] = useState(null);
    const [insufficientFundsMessage, setInsufficientFundsMessage] = useState("");

    // Connect to MetaMask
    const connectWallet = async () => {
        if (window.ethereum) {
            const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const signerInstance = providerInstance.getSigner();
            const candidateContractInstance = new ethers.Contract(CANDIDATE_CONTRACT_ADDRESS, CANDIDATE_ABI, signerInstance);
            const votingContractInstance = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_ABI, signerInstance);

            setProvider(providerInstance);
            setSigner(signerInstance);
            setCandidateContract(candidateContractInstance);
            setVotingContract(votingContractInstance);

            const signerAddress = await signerInstance.getAddress();
            setWalletAddress(signerAddress);

            const balance = await providerInstance.getBalance(signerAddress);
            setWalletBalance(ethers.utils.formatEther(balance));

            try {
                const ownerAddress = await votingContractInstance.owner();
                setOwner(ownerAddress);
                if (ownerAddress && signerAddress) {
                    setIsAdmin(ownerAddress.toLowerCase() === signerAddress.toLowerCase());
                } else {
                    console.error("Owner address or wallet address is null");
                }
                fetchCandidates(candidateContractInstance);
                checkVotingStatus(votingContractInstance, signerAddress);
            } catch (error) {
                console.error("Error accessing contract data:", error);
            }
        } else {
            alert("Please install MetaMask to use this app.");
        }
    };

    // Fetch candidates
    const fetchCandidates = async (contractInstance) => {
        try {
            const candidateCount = await contractInstance.getCandidatesCount();
            const candidatesArray = [];
            for (let i = 0; i < candidateCount; i++) {
                const candidate = await contractInstance.getCandidate(i);
                candidatesArray.push({
                    name: candidate[0],
                    voteCount: candidate[1].toNumber(),
                });
            }
            setCandidates(candidatesArray);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching candidates:", error);
            setLoading(false);
        }
    };

    // Check if the user has already voted and retrieve their vote
    const checkVotingStatus = async (votingContractInstance, signerAddress) => {
        try {
            const hasVoted = await votingContractInstance.hasVoted(signerAddress);
            setVoted(hasVoted);

            if (hasVoted) {
                const votedIndex = await votingContractInstance.getVotedCandidateIndex(signerAddress);
                setVotedCandidateIndex(votedIndex.toNumber());
            }
        } catch (error) {
            console.error("Error checking voting status:", error);
        }
    };

    const addCandidate = async () => {
        if (!newCandidate) {
            alert("Please enter a candidate name.");
            return;
        }

        try {
            const tx = await candidateContract.addCandidate(newCandidate);
            await tx.wait();
            alert(`Candidate "${newCandidate}" added successfully!`);
            setNewCandidate("");
            fetchCandidates(candidateContract);
        } catch (error) {
            console.error("Error adding candidate:", error);
            alert(error.message);
        }
    };

    const vote = async (candidateIndex) => {
        try {
            // Check the user's balance
            const balance = await provider.getBalance(walletAddress);
            const balanceInEther = ethers.utils.formatEther(balance);
    
            // Ensure the user has at least 0.01 Ether
            if (parseFloat(balanceInEther) < 0.01) {
                alert("Insufficient funds to cast a vote. You need at least 0.01 Ether.");
                return;
            }
    
            // Proceed with voting
            const tx = await votingContract.vote(candidateIndex, { value: ethers.utils.parseEther("0.01") });
            await tx.wait();
            alert("Vote submitted successfully!");
            setVoted(true);
            setVotedCandidateIndex(candidateIndex);
            fetchCandidates(candidateContract);
        } catch (error) {
            console.error("Error voting:", error);
            alert(error.message);
        }
    };

//de decomentat dupa deploy

//     describe("Gas Cost Analysis for Voting Contract", function () {
//     it("Should estimate gas for a vote function", async function () {
//     const [owner] = await ethers.getSigners();
//     const Voting = await ethers.getContractFactory("Voting");
//     const voting = await Voting.deploy(86400); // Deploy cu un argument, de exemplu durata votului
//     await voting.deployed();

//     const tx = await voting.vote(1); // presupunem că votăm candidatul cu id 1
//     const receipt = await tx.wait();
//     console.log(`Gas Used for Voting: ${receipt.gasUsed.toString()}`);
//   });
// });

    
    useEffect(() => {
        connectWallet();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <header className="header">
                <h1>Decentralized Voting App</h1>
            </header>

            <main className="mainGrid">
                <section className="leftPanel">
                    <div className="walletInfo">
                        {walletAddress ? (
                            <p>
                                Connected wallet: <strong>{walletAddress}</strong><br />
                                Balance: <strong>{walletBalance}</strong>
                            </p>
                        ) : (
                            <button className="connectButton" onClick={connectWallet}>
                                Connect Wallet
                            </button>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="adminSection">
                            <h2 className="subHeader">Add Candidate</h2>
                            <input
                                className="input"
                                type="text"
                                placeholder="Candidate name"
                                value={newCandidate}
                                onChange={(e) => setNewCandidate(e.target.value)}
                            />
                            <button className="addButton" onClick={addCandidate}>
                                Add
                            </button>
                        </div>
                    )}
                </section>

                <section className="rightPanel">
                    <h2 className="subHeader">Candidates</h2>
                    {voted && (
                        <div className="votedMessage">
                            <p>You have already voted. Thank you for participating!</p>
                        </div>
                    )}
                    <ul className="candidatesList">
    {candidates.map((candidate, index) => (
        <li
            key={index}
            className={`candidateItem ${
                voted
                    ? index === votedCandidateIndex
                        ? "votedCandidate"
                        : "disabledCandidate"
                    : ""
            }`}
        >
            <strong>{candidate.name}</strong>: {candidate.voteCount} votes
            <button
                className="voteButton"
                onClick={() => vote(index)}
                disabled={voted}
            >
                Vote
            </button>
        </li>
    ))}
</ul>

                </section>
            </main>
        </div>
    );
};

export default App;

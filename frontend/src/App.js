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
    const [owner, setOwner] = useState(null);
    const [network, setNetwork] = useState(null);
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const [totalVoters, setTotalVoters] = useState(0);
    const [networkError, setNetworkError] = useState("");
    const [winner, setWinner] = useState({ name: "", voteCount: 0 });
    const [winnerDeclared, setWinnerDeclared] = useState(false);

    const handleError = (error, customMessage) => {
        console.error(customMessage, error);
        let errorMessage = customMessage;
        if (error.data && error.data.message) {
            errorMessage += `\nDetails: ${error.data.message}`;
        } else if (error.message) {
            errorMessage += `\nDetails: ${error.message}`;
        }
        alert(errorMessage);
    };
    
    // Connect to MetaMask
    const connectWallet = async () => {
        try {
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
                fetchTotalVoters(votingContractInstance);
                console.log("da")

                const signerAddress = await signerInstance.getAddress();
                setWalletAddress(signerAddress);

                const balance = await providerInstance.getBalance(signerAddress);
                setWalletBalance(ethers.utils.formatEther(balance));

                const network = await providerInstance.getNetwork();
                setNetwork(network);

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
                    checkWinnerDeclared(votingContractInstance);
                } catch (error) {
                    handleError(error, "Error accessing contract data.");
                }
            } else {
                alert("Please install MetaMask to use this app.");
            }
        } catch (error) {
            handleError(error, "Error connecting to wallet."); 
        }
    };

    const fetchTotalVoters = async (contractInstance) => {
        if (!contractInstance) return;
        try {
            const totalVotersLocal= await contractInstance.getTotalVoters();
            console.log(contractInstance)
            console.log("Total Voters:", totalVotersLocal.toNumber());
            setTotalVoters(totalVotersLocal.toNumber());
        } catch (error) {
            console.error("Error fetching total voters:", error);
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
            handleError(error, "Error fetching candidates.");
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
            handleError(error, "Error checking voting status.");
        }
    };

    const addCandidate = async () => {
        if (!newCandidate) {
            alert("Please enter a candidate name.");
            return;
        }

        try {
            setTransactionInProgress(true);
            const tx = await candidateContract.addCandidate(newCandidate);
            await tx.wait();
            alert(`Candidate "${newCandidate}" added successfully!`);
            setNewCandidate("");
            fetchCandidates(candidateContract);
        } catch (error) {
            handleError(error, "Error adding candidate.");
        } finally {
            setTransactionInProgress(false);
        }
    };

    const vote = async (candidateIndex) => {
        try {
            // Check the user's balance
            const balance = await provider.getBalance(walletAddress);
            const balanceInEther = ethers.utils.formatEther(balance);
    
            // Ensure the user has at least 0.00001 Ether
            if (parseFloat(balanceInEther) < 0.00001) {
                alert("Insufficient funds to cast a vote. You need at least 0.00001 Ether.");
                return;
            }
    
            // Proceed with voting
            setTransactionInProgress(true);
            const tx = await votingContract.vote(candidateIndex, { value: ethers.utils.parseEther("0.00001") });
            await tx.wait();
            alert("Vote submitted successfully!");
            setVoted(true);
            setVotedCandidateIndex(candidateIndex);
            fetchCandidates(candidateContract);
        } catch (error) {
            handleError(error, "Error voting.");
        } finally {
            setTransactionInProgress(false);
        }
    };

    const checkWinnerDeclared = async (votingContractInstance) => {
        try {
            const filter = votingContractInstance.filters.WinnerDeclared();
            const events = await votingContractInstance.queryFilter(filter);
            if(events.length > 0) {
                setWinnerDeclared(true);
                const winnerData = await votingContractInstance.getWinner();
                setWinner({ name: winnerData[0], voteCount: winnerData[1].toNumber() });
            } else {
                setWinnerDeclared(false);
            }
        } catch (error) {
            handleError(error, "Error checking if winner is declared.");
        }
    };

    const declareWinner = async () => {
        try {
            setTransactionInProgress(true);
            const tx = await votingContract.declareWinner();
            await tx.wait();
            alert("Winner declared successfully!");
            checkWinnerDeclared(votingContract);
        } catch (error) {
            handleError(error, "Error declaring winner.");
        } finally {
            setTransactionInProgress(false);
        }
    };
  
    useEffect(() => {
        connectWallet();
        

        if(window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length === 0) {
                    console.log("Please connect to MetaMask.");
                    setNetworkError("Please connect to MetaMask.");
                } else {
                    console.log("Account changed to ${accounts[0]}");
                    setWalletAddress(accounts[0]);
                    connectWallet();
                }
            });

            window.ethereum.on("networkChanged", (networkId) => {
                console.log("Network changed to ${networkId}");
                setNetworkError(`Network changed to ${networkId}. Please reconnect.`);
                connectWallet();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("networkChanged", () => {});
                window.ethereum.removeListener("accountsChanged", () => {});
            }
        };
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <header className="header">
                <h1>Student Representative Voting App</h1>
            </header>

            <main className="mainGrid">
                <section className="leftPanel">
                    <div className="walletInfo">
                        {walletAddress ? (
                            <p>
                                Connected wallet: <strong>{walletAddress}</strong><br />
                                Balance: <strong>{walletBalance} ETH</strong> <br />
                                Network: <strong>{network ? network.name : "Unknown"}</strong>
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
                            <button className="addButton" onClick={addCandidate} disabled={transactionInProgress}>
                                {transactionInProgress ? "Processing..." : "Add"}
                            </button>
                            <button className="declareWinnerButton" onClick={declareWinner} disabled={transactionInProgress}>
                                {transactionInProgress ? "Processing..." : "Declare Winner"}
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
                                <strong>{candidate.name}</strong>: {candidate.voteCount} votes {(candidate.voteCount * 100)/totalVoters} %
                                <button
                                    className="voteButton"
                                    onClick={() => vote(index)}
                                    disabled={voted}
                                >
                                    {transactionInProgress ? "Processing..." : "Vote"}
                                </button>
                            </li>
                        ))}
                    </ul>
                    {networkError && (
                        <div className="networkError">
                            <p>{networkError}</p>
                        </div>
                    )}
                    <div className="winnerSection">
                        <h2 className="subHeader">Winner</h2>
                        <p>
                            {winnerDeclared ? (
                                <>
                                    <strong>{winner.name}</strong> with {winner.voteCount} votes
                                </>
                            ) : (
                                "Winner not declared yet."
                            )}
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default App;

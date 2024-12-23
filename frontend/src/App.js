import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
//import abi from "./abi.json";
import { CONTRACT_ADDRESS, ABI} from "./config.js";

const App = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); // Stare pentru a verifica dacă utilizatorul este admin
    const [newCandidate, setNewCandidate] = useState("");
    const [owner, setOwner] = useState(null);


    // Conectează-te la MetaMask
    const connectWallet = async () => {
        if (window.ethereum) {
            const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const signerInstance = providerInstance.getSigner();
            const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI, signerInstance);

            if (!contractInstance) {
                console.error("Contract instance is null");
                return; // Exit if contract instance is not created
            }

            setProvider(providerInstance);
            setSigner(signerInstance);
            setContract(contractInstance);
            const signerAddress = await signerInstance.getAddress();
            setWalletAddress(signerAddress);

            console.log("Provider:", providerInstance);
            console.log("Signer:", signer);
            console.log("Contract Instance:", contract);
            console.log("Signer Address:", signerAddress);


            try {
                console.log("bloc de try");
                console.log("Contract Address:", CONTRACT_ADDRESS);
                console.log("ABI:", ABI);
                console.log("Signer Address:", await signerInstance.getAddress());
                const ownerAddress = await contractInstance.owner();
                console.log("ownerAddress:", ownerAddress);
                console.log("walletAddress:", signerAddress);
                if (ownerAddress && signerAddress) {
                    setIsAdmin(ownerAddress.toLowerCase() === signerAddress.toLowerCase());
                } else {
                    console.error("Owner address or wallet address is null");
                }
                
                console.log('Owner address:', ownerAddress);
                fetchCandidates(contractInstance);
            } catch (error) {
                console.log("Error accessing contract owner:", error);
            }
        } else {
            alert("Please install MetaMask to use this app.");
        }
    };

    const fetchCandidates = async (contractInstance) => {
        try {
            const candidateCount = await contractInstance.getCandidatesCount();
            console.log("Candidate Count:", candidateCount.toNumber());
            const candidatesArray = [];
            for (let i = 0; i < candidateCount; i++) {
                const candidate = await contractInstance.getCandidate(i);
                candidatesArray.push({
                    name: candidate[0],
                    voteCount: candidate[1].toNumber(),
                });
            }
            console.log("Candidates Array:", candidatesArray);
            setCandidates(candidatesArray);
            setLoading(false);
        } catch (error) {
            console.log("Error fetching candidates:", error);
            setLoading(false);
        }
    };
    console.log("Candidates:", candidates);

    const addCandidate = async () => {
        if (!newCandidate) {
            alert("Please enter a candidate name.");
            return;
        }

        try {
            const tx = await contract.addCandidate(newCandidate);
            await tx.wait();
            alert(`Candidate "${newCandidate}" added successfully!`);
            setNewCandidate("");
            fetchCandidates();
        } catch (error) {
            console.error("Error adding candidate:", error);
            alert(error.message);
        }
    };

    

    const vote = async (candidateIndex) => {
      try {
          const tx = await contract.vote(candidateIndex, { value: ethers.utils.parseEther("0.01") });
          await tx.wait();
          alert("Vote submitted successfully!");
          setVoted(true);
          fetchCandidates(); // Actualizează lista de candidați după vot
      } catch (error) {
          console.error("Error voting:", error);
          alert(error.message);
      }
  };
  

    useEffect(() => {
        connectWallet();
    }, []);

    // useEffect(() => {
    //     if (contract) {
    //         fetchCandidates();
    //     }
    // }, [contract]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Decentralized Voting App</h1>
            {walletAddress ? (
                <p>Connected wallet: <strong>{walletAddress}</strong></p>
            ) : (
                <button onClick={connectWallet}>Connect Wallet</button>
            )}

            {isAdmin &&  (
                  <div>
                      <h2>Add Candidate</h2>
                      <input
                          type="text"
                          placeholder="Candidate name"
                          value={newCandidate}
                          onChange={(e) => setNewCandidate(e.target.value)}
                      />
                      <button onClick={addCandidate}>Add</button>
                  </div>
              )
              
            }

            <h2>Candidates</h2>
            <ul>
                {candidates.map((candidate, index) => (
                    <li key={index}>
                        <strong>{candidate.name}</strong>: {candidate.voteCount} votes
                        <button onClick={() => vote(index)} disabled={voted}>
                            Vote
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;

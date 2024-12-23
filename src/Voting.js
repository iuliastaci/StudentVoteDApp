import { ethers } from "ethers";
import React, { useState, useEffect } from "react";

const Voting = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [account, setAccount] = useState("");

  const contractAddress = "0xAaA0fBF5faC564377f6F4020FA01044E59786849"; // De schimbat adresa contractului in cea personala
  const abi = [ //abi-ul se gaseste in contracts/Voting.sol/Voting.json, dupa ce am dat comanda in terminal 'npx hardhat compile'
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "CandidateAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "candidate",
          "type": "string"
        }
      ],
      "name": "Voted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        }
      ],
      "name": "addCandidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "candidates",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getResults",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "voteCount",
              "type": "uint256"
            }
          ],
          "internalType": "struct Voting.Candidate[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasVoted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "candidateIndex",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        const contract = new ethers.Contract(contractAddress, abi, provider.getSigner());
        setContract(contract);
      }
    };

    init();
  }, []);

  const fetchCandidates = async () => {
    if (contract) {
      const candidates = await contract.getResults();
      setCandidates(candidates);
    }
  };

  const vote = async (index) => {
    if (contract) {
      await contract.vote(index);
      fetchCandidates(); // Actualizează lista
    }
  };

  const voteForCandidate = async (candidateIndex) => {
    try {
      const tx = await contract.vote(candidateIndex); // contract este instanța contractului pe blockchain
      await tx.wait();
      alert("Votul a fost înregistrat cu succes!");
    } catch (error) {
      console.error("Eroare la votare:", error);
    }
  };
  

  return (
    <div>
      <h1>Voting DApp</h1>
      <p>Connected Account: {account}</p>
      <button onClick={fetchCandidates}>Fetch Candidates</button>
      <ul>
        {candidates.map((candidate, index) => (
          <li key={index}>
            {candidate.name} - {candidate.voteCount} votes
            <button onClick={() => vote(index)}>Vote</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Voting;

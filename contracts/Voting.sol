// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    address public owner;
    Candidate[] public candidates;
    mapping(address => bool) public hasVoted;
    uint256 public votingDeadline;

    event CandidateAdded(string name);
    event Voted(address voter, uint256 candidateIndex);
    event WinnerDeclared(string name, uint256 voteCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    modifier onlyDuringVoting() {
        require(block.timestamp < votingDeadline, "Voting period has ended.");
        _;
    }

    constructor(uint256 votingDuration) {
        owner = msg.sender; // Setează proprietarul contractului
        votingDeadline = block.timestamp + votingDuration; // Definește durata votului
    }

    // Adaugă un candidat
    function addCandidate(string memory name) public onlyOwner {
        candidates.push(Candidate(name, 0));
        emit CandidateAdded(name); // Emite evenimentul pentru un candidat nou
    }

    // Obtine numarul de candidati
    function getCandidatesCount() public view returns (uint256) {
        return candidates.length;
    }

    // Obtine ldetaliile candidatului
    function getCandidate(uint256 index) public view returns (string memory name, uint256 voteCount) {
        require(index < candidates.length, "Invalid candidate index.");
        return (candidates[index].name, candidates[index].voteCount);
    }

    // Votează pentru un candidat
    function vote(uint256 candidateIndex) public payable onlyDuringVoting {
        require(msg.value == 0.01 ether, "Voting requires 0.01 ETH."); // Taxă pentru vot
        require(!hasVoted[msg.sender], "Already voted."); // Verifică dacă a votat deja
        require(candidateIndex < candidates.length, "Invalid candidate."); // Verifică validitatea candidatului

        candidates[candidateIndex].voteCount += 1; // Crește numărul de voturi pentru candidat
        hasVoted[msg.sender] = true; // Marchează utilizatorul ca fiind votat

        emit Voted(msg.sender, candidateIndex); // Emite evenimentul de vot
    }

    // Obține lista candidaților și rezultatele
    function getResults() public view returns (Candidate[] memory) {
        return candidates;
    }

    // Obține candidatul câștigător
    function getWinner() public view returns (string memory winnerName, uint256 winnerVoteCount) {
        require(candidates.length > 0, "No candidates available."); // Verifică dacă există candidați
        
        uint256 highestVoteCount = 0;
        uint256 winnerIndex = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > highestVoteCount) {
                highestVoteCount = candidates[i].voteCount;
                winnerIndex = i;
            }
        }

        return (candidates[winnerIndex].name, candidates[winnerIndex].voteCount); // Returnează câștigătorul
    }

    // Declară candidatul câștigător și emite evenimentul
    function declareWinner() public onlyOwner {
        require(block.timestamp > votingDeadline, "Voting period is not over yet.");
        (string memory winnerName, uint256 winnerVoteCount) = getWinner();

        emit WinnerDeclared(winnerName, winnerVoteCount); // Emite evenimentul pentru câștigător
    }
}

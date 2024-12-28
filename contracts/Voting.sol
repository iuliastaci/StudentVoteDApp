// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICandidateRegistry {
    function getCandidatesCount() external view returns (uint256);
    function getCandidate(uint256 index) external view returns (string memory name, uint256 voteCount);
    function incrementVote(uint256 index) external;
}

contract Voting {
    address public owner;
    address public candidateRegistryAddress;
    mapping(address => bool) public hasVoted;
    uint256 public votingDeadline;

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

    constructor(uint256 votingDuration, address _candidateRegistryAddress) {
        owner = msg.sender; // Setează proprietarul contractului
        votingDeadline = block.timestamp + votingDuration; // Definește durata votului
        candidateRegistryAddress = _candidateRegistryAddress; 
    }

    // Obtine detaliile candidatului
    function getCandidateDetails(uint256 index) public view returns (string memory name, uint256 voteCount) {
        ICandidateRegistry candidateRegistry = ICandidateRegistry(candidateRegistryAddress);
        return candidateRegistry.getCandidate(index);
    }

    // Votează pentru un candidat
    function vote(uint256 candidateIndex) public payable onlyDuringVoting {
         uint startGas = gasleft();
    require(!hasVoted[msg.sender], "Already voted.");
    
    // Logică de vot aici

    
    require(spentGas <= 50000, "This transaction consumes too much gas.");
        require(msg.value == 0.01 ether, "Voting requires 0.01 ETH."); // Taxă pentru vot
        require(!hasVoted[msg.sender], "Already voted."); // Verifică dacă a votat deja
        
        ICandidateRegistry candidateRegistry = ICandidateRegistry(candidateRegistryAddress);
        require(candidateIndex < candidateRegistry.getCandidatesCount(), "Invalid candidate index."); // Verifică dacă indexul candidatului este valid

        candidateRegistry.incrementVote(candidateIndex); // Incrementarea numărului de voturi pentru candidat
        hasVoted[msg.sender] = true; // Marchează utilizatorul ca fiind votat

        emit Voted(msg.sender, candidateIndex); // Emite evenimentul de vot

        hasVoted[msg.sender] = true;
    uint spentGas = startGas - gasleft();
    }

    // Obține lista candidaților și rezultatele
    function getResults() public view returns (string[] memory names, uint256[] memory voteCounts) {
        ICandidateRegistry candidateRegistry = ICandidateRegistry(candidateRegistryAddress);
        uint256 candidatesCount = candidateRegistry.getCandidatesCount();

        names = new string[](candidatesCount);
        voteCounts = new uint256[](candidatesCount);

        for(uint256 i = 0; i < candidatesCount; i++) {
            (string memory name, uint256 voteCount) = candidateRegistry.getCandidate(i);
            names[i] = name;
            voteCounts[i] = voteCount;
        }
        
        return (names, voteCounts);
    }

    // Obține candidatul câștigător
    function getWinner() public view returns (string memory winnerName, uint256 winnerVoteCount) {
        ICandidateRegistry candidateRegistry = ICandidateRegistry(candidateRegistryAddress);
        uint256 candidatesCount = candidateRegistry.getCandidatesCount();

        require(candidatesCount > 0, "No candidates available."); // Verifică dacă există candidați
        
        uint256 highestVoteCount = 0;
        uint256 winnerIndex = 0;

        for (uint256 i = 0; i < candidatesCount; i++) {
            (, uint256 voteCount) = candidateRegistry.getCandidate(i);
            if (voteCount > highestVoteCount) {
                highestVoteCount = voteCount;
                winnerIndex = i;
            }
        }

        (winnerName, winnerVoteCount) = candidateRegistry.getCandidate(winnerIndex);
        return (winnerName, winnerVoteCount); // Returnează câștigătorul
    }

    // Declară candidatul câștigător și emite evenimentul
    function declareWinner() public onlyOwner {
        require(block.timestamp > votingDeadline, "Voting period is not over yet.");
        (string memory winnerName, uint256 winnerVoteCount) = getWinner();

        emit WinnerDeclared(winnerName, winnerVoteCount); // Emite evenimentul pentru câștigător
    }


}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CandidateRegistry{
    struct Candidate {
        string name;
        uint256 voteCount;
    }
    address public owner;
    Candidate[] public candidates;

    event CandidateAdded(string name);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Adauga un candidat
    function addCandidate(string  memory name) public onlyOwner() {
        candidates.push(Candidate(name, 0));
        emit CandidateAdded(name);
    }

    // Obtine numarul de candidati
    function getCandidatesCount() public view returns (uint256) {
        return candidates.length;
    }

    // Obtine detaliile candidatului
    function getCandidate(uint256 index) public view returns (string memory name, uint256 voteCount) {
        require(index < candidates.length, "Invalid candidate index.");
        return (candidates[index].name, candidates[index].voteCount);
    }

    // Creste numarul de voturi pentru un candidat
    function incrementVote(uint256 index) external {
        require(index < candidates.length, "Invalid candidate index.");
        candidates[index].voteCount += 1;
    }
}
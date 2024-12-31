# StudentVoteDApp

**StudentVoteDApp** is a decentralized application (DApp) for conducting student representative elections. Built using **React**, **Ethereum**, **Ethers.js** and **Solidity**, it ensures secure and transparent voting. It uses **Hardhat** as the local Ethereum development network and **Sepolia** as the test network.

## Features
- Connect wallet via Metamask.
- View candidate list with current vote counts.
- Add new candidates (admin functionality).
- Cast votes securely for a candidate.
- Declare the winner after the voting period ends (admin functionality).
- View the winner once voting has concluded.
- Fetch real-time updates of candidates and votes from the blockchain.


## Prerequisites

Make sure you have the following installed:

1. **Node.js**: [Download](https://nodejs.org)
2. **MetaMask Wallet**: [Download](https://metamask.io)
3. **Hardhat**: Installed via npm.
4. **Ethereum Test Tokens**: For testing on Sepolia.

## Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/iuliastaci/StudentVoteDApp.git
cd StudentVoteDApp
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start Local Blockchain (Hardhat)**
Open a new terminal and run:
```bash
npx hardhat node
```

4. **Deploy Smart Contracts**
In another terminal, deploy the contracts to Sepolia:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

5. **Connect frontend to Smart Contract**
- Update `config.js` with the contracts addresses and ABI from the deployment output.

6. **Start the frontend**
Run the app in development mode:
```bash
cd frontend
npm start
```

## Running Tests

- Tests for the smart contracts are located in the `test` folder.
- Make sure your Hardhat node is running (`npx hardhat node`) and execute: 
```bash
npx hardhat test
```
- The test results will be displayed in the terminal, detailing the passed and failed cases.

## Usage

1. **Open the Application**
Navigate to `https://localhost:3000` in your browser.

2. **Connect MetaMask**
Connect your MetaMask wallet to interact with the app.

3. **Admin Features**
- Add candidates through the admin interface.
- Declare the winner after the voting period ends.

4. **Vote**
Cast votes and view live updates.

5. **View Winner**
Once voting concludes, view the declared winner.

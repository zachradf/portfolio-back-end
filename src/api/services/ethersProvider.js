// /backend/utils/ethersProvider.js
// const { ethers } = require('ethers');
import ethers from 'ethers';
import contractABI from '../../Token/Token/';
import dotenv from 'dotenv';
dotenv.config();
// const contractABI = require('../../token-project/build/contracts/MyToken.json').abi; // Adjust the path as needed to reach Truffle build artifacts
const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Deployed contract address

// Setup provider - using Infura. Replace YOUR_INFURA_PROJECT_ID and YOUR_INFURA_PROJECT_SECRET
const provider = new ethers.providers.InfuraProvider('ropsten', {
  projectId: 'YOUR_INFURA_PROJECT_ID',
  projectSecret: 'YOUR_INFURA_PROJECT_SECRET',
});

// Wallet private key - should be securely managed, consider using environment variables or a secure vault in production
const privateKey = 'YOUR_WALLET_PRIVATE_KEY';
const wallet = new ethers.Wallet(privateKey, provider);

// Contract instance
const tokenContract = new ethers.Contract(contractAddress, contractABI, wallet);

module.exports = {
  tokenContract,
};

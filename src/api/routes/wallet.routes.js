import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
import { ethers, InfuraProvider } from 'ethers';
import BigNumber from 'bignumber.js';

const router = express.Router();
dotenv.config();

// Function to convert the hexadecimal balance to Ether
function convertHexToEther(hexBalance) {
  console.log('hexBalance');
  // Convert hex string to a BigNumber in Wei
  const weiBalance = BigNumber(hexBalance);
  console.log('hexBalance', weiBalance);

  // Convert Wei to Ether
  // const etherBalance = ethers.formatEther(weiBalance);
  return weiBalance; // Returns a string representation of the Ether value
}
async function getWalletBalance(req, res, next) {
  const address = req.params.address;
  // const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`);
  const provider = new InfuraProvider('sepolia', process.env.INFURA_API_KEY);

  // Connect to the ETH balance checking
  try {
    const balance = await provider.getBalance(address);
    const ethBalance = ethers.utils.formatEther(balance);
    console.log('ETH Balance:', ethBalance);

    // Define token contract details
    const tokenAddress = 'YOUR_TOKEN_CONTRACT_ADDRESS';
    const tokenABI = [
      // Minimum ABI to get ERC20 Token balance
      'function balanceOf(address owner) view returns (uint256)',
    ];
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);

    // Get the token balance
    const tokenBalance = await tokenContract.balanceOf(address);
    const formattedTokenBalance = ethers.utils.formatUnits(tokenBalance, 18); // Assuming your token uses 18 decimals

    console.log('Token Balance:', formattedTokenBalance);

    return res.json({
      ethBalance,
      tokenBalance: formattedTokenBalance,
    });
  } catch (error) {
    console.error(
      'Error:',
      error.response ? error.response.data : error.message
    );
    next();
  }
}

router.get('/:address', getWalletBalance);

export default router;

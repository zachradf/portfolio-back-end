import { ethers, InfuraProvider } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

export const generateWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

// export const connectToProvider = () => {
//   console.log('Connecting to provider...', ethers.providers)
//   const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_API_KEY);
//   return provider;
// };
export const connectToProvider = () => {
  // Define your network; if you're using 'sepolia' testnet, specify it here
  // const network = 'sepolia';  // Change to 'homestead' for Ethereum mainnet or other network names/URLs as needed
  // const networkParam = ethers.providers.getNetwork(network);
  // Configure options to use Infura

  // Get a provider backed by Infura
  const provider = new InfuraProvider('sepolia', process.env.INFURA_API_KEY);
  return provider;
};

export const getSigner = (privateKey, provider) => {
  const wallet = new ethers.Wallet(privateKey, provider);
  return wallet;
};

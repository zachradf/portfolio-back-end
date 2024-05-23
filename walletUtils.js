import { ethers } from 'ethers';
import dotenv from 'dotenv'

dotenv.config();

export const generateWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  };

  export const connectToProvider = () => {
    const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_API_KEY);
    return provider;
  };
  
  export const getSigner = (privateKey, provider) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
  };
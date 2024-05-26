// routes/user.routes.js
import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import CryptoJS from 'crypto-js';

import { generateWallet } from '../utils/walletUtils.js';
const router = express.Router();

const encryptPrivateKey = (privateKey, secret) => {
  return CryptoJS.AES.encrypt(privateKey, secret).toString();
};

// route to get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error', err);
  }
});

// route to create a new user
router.post('/', async (req, res) => {
  const { username, password, email, name, nftProfilePicture } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const { address, privateKey } = generateWallet();
  const encryptedPrivateKey = await encryptPrivateKey(privateKey, process.env.SECRET+username);

  try {
    let user = new User({
      username,
      password: hashedPassword,
      email,
      name,
      walletAddress: address,
      privateKey:encryptedPrivateKey,
      nftProfilePicture,
    });

    await user.save();
    try {
        // Specify the amount of tokens to mint or transfer
        // const tokens = ethers.utils.parseUnits("1000", 18); // For 1000 tokens, adjust decimals as needed

        // Call transfer function from the contract to distribute tokens
        // const tx = await tokenContract.transfer(address, tokens);
        // await tx.wait(); // Wait for the transaction to be mined

        // res.send({ success: true, message: `Tokens successfully sent to ${address}` });
    } catch (error) {
        console.error('Token transfer error:', error);
        res.status(500).send({ success: false, message: 'Failed to send tokens' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;

// routes/user.routes.js
import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import CryptoJS from 'crypto-js';

import { generateWallet, connectToProvider, getSigner } from '../walletUtils.js';
const router = express.Router();

const encryptPrivateKey = (privateKey, secret) => {
  return CryptoJS.AES.encrypt(privateKey, secret).toString();
};

function hashString(inputString) {
  return CryptoJS.SHA256(inputString).toString(CryptoJS.enc.Hex);
}
// Example route to get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error', err);
  }
});

// Example route to create a new user
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
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;

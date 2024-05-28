// routes/user.routes.js
import express from 'express';
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';
import createUser from '../services/user/createUser.js';
import loginUser from '../services/user/loginUser.js';
import setSession from '../services/setSession.js';
import { generateWallet } from '../services/walletUtils.js';
const router = express.Router();

const encryptPrivateKey = (privateKey, secret) => {
  return CryptoJS.AES.encrypt(privateKey, secret).toString();
};

// route to create a new user
router.post('/create', async (req, res) => {
  const { username, password, email, name, nftProfilePicture } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const { address, privateKey } = generateWallet();
  const encryptedPrivateKey = await encryptPrivateKey(privateKey, process.env.SECRET+username);

  try {
    const user = await createUser(username, hashedPassword, email, name, address, encryptedPrivateKey, nftProfilePicture)
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await loginUser(username, password, res)
    if(!user){
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    setSession(user, req)
    res.json({user});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Failed to logout.');
      }
      res.clearCookie('connect.sid'); // Adjust this if your session ID cookie has a different name
      res.status(200).send('Logged out successfully.');
    });
  } else {
    res.status(200).send('No session to logout.');
  }
});

export default router;

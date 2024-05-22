// routes/user.routes.js
import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
const router = express.Router();

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
  const { username, password, email, name, walletAddress, nftProfilePicture } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    let user = new User({
      username,
      password: hashedPassword,
      email,
      name,
      walletAddress,
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

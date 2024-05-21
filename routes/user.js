// routes/user.routes.js
import express from 'express';
import User from '../models/user.model';
const router = express.Router();

// Example route to get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Example route to create a new user
router.post('/', async (req, res) => {
  const { username, password, email, name, walletAddress, nftProfilePicture } = req.body;

  try {
    let user = new User({
      username,
      password,
      email,
      name,
      walletAddress,
      nftProfilePicture
    });

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Assuming you're using JWT for tokens
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();
const router = express.Router();

router.post('/', async (req, res) => {
  console.log('req.body', req.body);
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token if needed
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Set user details in session
    req.session.user = user; // Customize based on the info you need
    req.session.isAuthenticated = true; // Explicitly mark the session as authenticated


    res.json({ token, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;

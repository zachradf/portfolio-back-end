import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors'
import connectDB from './db.js'
import dotenv from 'dotenv'

import userRouter from './routes/user.routes.js'
import authRouter from './routes/auth.routes.js'
import walletRouter from './routes/wallet.routes.js'
import githubRouter from './routes/github.routes.js'

dotenv.config();
connectDB()
// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
//session middleware
app.use(session({
  secret: 'your_secret_key',  // Choose a strong secret for session encryption
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set true in production with HTTPS
}));

// Routes
app.get('/api/auth/check-session', (req, res) => {
  // console.log('req.session in check-session', req.session.user, req.session.user._id);
  // const {_id, username, email, name, walletAddress, nftProfilePicture} = req.session.user;
  if (req.session.user) {
    console.log('req.session.user in check-session', req.session.user);
    res.send({
      isAuthenticated: true,
      user: req.session.user // Add more fields as necessary
    });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

// File: routes/auth.routes.js (assuming this file handles authentication related routes)

// Route to clear the session
app.post('/api/auth/logout', (req, res) => {
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


app.use('/api/users', userRouter);
app.use('/api/auth/login', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/auth/github', githubRouter);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors'
import connectDB from './db.js'
import dotenv from 'dotenv'

import userRouter from './src/api/routes/user.routes.js'
import walletRouter from './src/api/routes/wallet.routes.js'
import githubRouter from './src/api/routes/github.routes.js'
import sessionRouter from './src/api/routes/session.routes.js'

dotenv.config();
connectDB()
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(session({
  secret: 'your_secret_key',  // Choose a strong secret for session encryption
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set true in production with HTTPS
}));

app.use('/api/users', userRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/auth/github', githubRouter);
app.use('/api/check-session', sessionRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

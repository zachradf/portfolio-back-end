import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'
import connectDB from './db.js'
import dotenv from 'dotenv'

import userRouter from './routes/user.routes.js'
import authRouter from './routes/auth.routes.js'

dotenv.config();
connectDB()
// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes
app.use('/api/users', userRouter);
app.use('/api/login', authRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

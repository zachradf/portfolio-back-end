import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const router = express.Router();

router.get('/initiate', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.GITHUB_REDIRECT_URI);
  
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
  
    res.json({ url: githubAuthUrl });
  });
  
  router.post('/exchange-code', async (req, res) => {
    const { code, user } = req.body;
    console.log('exchange code above try', code);

    try {
      console.log('exchange code', code);
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }, {
        headers: { Accept: 'application/json' },
      });
      const { access_token } = response.data;
      req.session.githubToken = access_token; 
      if(!req.session.user) req.session.user = user // Store the token in session
      console.log('req.session after if', req.session);
      res.json(req.session);  // Redirect or handle as needed
      // res.json({ access_token });
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      res.status(500).send('Authentication failed');
    }
  });

  export default router;
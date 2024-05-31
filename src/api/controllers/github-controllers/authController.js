import * as githubService from '../../services/github/githubServices.js';

const githubAuthController = {};

githubAuthController.initiateOAuth = (req, res) => {
  const { url } = githubService.initiateOAuth();
  res.json({ url });
};

githubAuthController.exchangeCode = async (req, res) => {
  const { code, user } = req.body;

  try {
    const { access_token } = await githubService.exchangeCodeForToken(
      code,
      user
    );
    req.session.authToken = access_token;

    if (!req.session.user) req.session.user = user;

    res.json(req.session);
  } catch (error) {
    console.error('Failed to exchange code for token:', error);
    res.status(500).send('Authentication failed');
  }
};

export default githubAuthController;

import * as githubService from '../services/github/githubServices.js';

const githubController = { };
  githubController.initiateOAuth = (req, res) => {
  const { url } = githubService.initiateOAuth();
  res.json({ url });
};

githubController.exchangeCode = async (req, res) => {
  const { code, user } = req.body;

  try {
    const { access_token } = await githubService.exchangeCodeForToken(code, user);
    req.session.authToken = access_token;

    if (!req.session.user) req.session.user = user;

    res.json(req.session);
  } catch (error) {
    console.error('Failed to exchange code for token:', error);
    res.status(500).send('Authentication failed');
  }
};

githubController.listRepositories = async (req, res) => {
  if (!req.session || !req.session.authToken) {
    return res.status(401).json({ error: 'No authentication token found in session' });
  }

  const { authToken } = req.session.authToken

  try {
    const data = await githubService.listRepositories( authToken );
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

githubController.checkStarred = async (req, res) => {
  if (!req.session || !req.session.authToken) {
    return res.status(401).json({ error: 'No authentication token found in session' });
  }

  const { owner, repo } = req.params;
  const { authToken } = req.session;

  try {
    const result = await githubService.checkStarred( owner, repo, authToken);
    res.json(result);
  } catch (error) {
    console.error('Failed to check star status:', error);
    res.status(500).json({ error: 'Failed to check star status' });
  }
};

// Get repository details
githubController.getDetails =  async (req, res) => {
  if (!req.session || !req.session.authToken) {
    return res.status(401).json({ error: 'No authentication token found in session' });
  }

  const { owner, repo } = req.params;
  const {authToken} =  req.session

  try {
    const repoDetails = await githubService.getRepoDetails(owner, repo, authToken)
    res.json(repoDetails);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch repository details', error });
  }
};

  githubController.getREADME = async (req, res) => {
    if (!req.session || !req.session.authToken) {
      return res.status(401).json({ error: 'No authentication token found in session' });
    }

    const { owner, repo } = req.params;
    const {authToken} = req.session
  
    try {
      const markdown = await githubService.getREADME(owner, repo, authToken)
      console.log('markdown', markdown)
      res.json({ content: markdown });
    } catch (error) {
      res.status(500).json({ message: 'Failed to load README', error });
    }
  };

  githubController.starRepo = async (req, res) => {
    if (!req.session || !req.session.authToken) {
      return res.status(401).send('Authentication required');
    }

    const { owner, repo } = req.params;
    const { authToken } = req.session

    try {
      await githubService.star(owner, repo, authToken)
      res.status(204).send();  // HTTP 204 No Content for successful star operation
    } catch (error) {
      console.error('Failed to star repository:', error);
      res.status(500).json({ message: 'Failed to star repository', error });
    }
  };

githubController.unstarRepo = async (req, res) => {
  if (!req.session || !req.session.authToken) {
    return res.status(401).json({ error: 'No authentication token found in session' });
  }

  const { owner, repo } = req.params;
  const { authToken } = req.session

  try {
    await githubService.unStar(owner, repo, authToken)
    res.status(204).send();
  } catch (error) {
    console.error(`Failed to unstar repository: ${owner}/${repo}`, error);
    res.status(500).json({ error: 'Failed to unstar repository' });
  }
};

githubController.submitIssue = async (req, res) => {
  if (!req.session || !req.session.authToken) {
    return res.status(401).send('Authentication required');
  }

  const { owner, repo } = req.params;
  const { title, body } = req.body; // Expect title and body from the request body
  const { authToken } = req.session;

  if (!title) {
    return res.status(400).send('Issue title is required');
  }

  try {
   const issue = await githubService.submitIssue(owner, repo, authToken, title, body)
    res.json(issue.data);
  } catch (error) {
    console.error('Failed to create issue:', error);
    res.status(500).json({ message: 'Failed to create issue', error });
  }
};

githubController.forkRepo = async (req, res) => {
  if (!req.session || !req.session.authToken) {
    return res.status(401).send('Authentication required');
  }

  const { owner, repo } = req.params;
  const { authToken } = req.session

  try {
    const response = await githubService.forkRepo(owner, repo, authToken)
    res.status(202).json(response.data);  // HTTP 202 Accepted for asynchronous fork operation
  } catch (error) {
    console.error('Failed to fork repository:', error);
    res.status(500).json({ message: 'Failed to fork repository', error });
  }
}

githubController.pushCode =  async (req, res) => {
  if (!req.session || !req.session.authToken) {
    return res.status(401).json({ error: 'No authentication token found in session' });
  }

  const { path, message, content, branch } = req.body;
  const { owner, repo } = req.params;
  const { authToken } = req.session

  try {
    const data = await githubService.updateRepo(req, res)
    console.log(`File updated successfully: ${data}`);
  } catch (error) {
      console.error(`Failed to update file: ${error}`);
      return res.status(500).json({ error: 'Failed to update file', details: error.message });
    }
};

export default githubController

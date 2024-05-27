import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { Octokit } from '@octokit/rest';


dotenv.config();
const router = express.Router();

router.get('/initiate', (req, res) => {
    // const clientId = process.env.GITHUB_APP_CLIENT_ID;
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.GITHUB_REDIRECT_URI);
    const githubAppAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
  
    res.json({ url: githubAppAuthUrl });
  });
  
  router.post('/exchange-code', async (req, res) => {
    const { code, user } = req.body;

    try {
      // const clientId = process.env.GITHUB_APP_CLIENT_ID;
      const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
      // const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
      const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }, {
        headers: { Accept: 'application/json' },
      });
      const { access_token } = response.data;
      req.session.authToken = access_token; 
      if(!req.session.user) req.session.user = user // Store the token in session
      console.log('req.session after if', req.session);
      res.json(req.session);  // Redirect or handle as needed
      // res.json({ access_token });
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      res.status(500).send('Authentication failed');
    }
  });

  router.get('/user/repos', async (req, res) => {
    const octokit = new Octokit({
      auth: req.session.authToken
    });
    console.log('Fetching repositories...', req.session, req.session.authToken);
    if (!req.session || !req.session.authToken) {
      return res.status(401).json({ error: 'No authentication token found in session' });
    }
    
    try {
      const { data } = await octokit.repos.listForAuthenticatedUser({
        visibility: 'all', // This can be 'all', 'public', or 'private'
        per_page: 100, // Adjust based on how many repos you want to fetch per page
        page: 1 // For pagination
      });
      res.json(data);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      res.status(500).json({ error: 'Failed to fetch repositories' });
    }
  });

  router.get('/is-starred/:owner/:repo', async (req, res) => {
    console.log('req.session.authToken', req.session.authToken)  

    if (!req.session || !req.session.authToken) {
      return res.status(401).json({ error: 'No authentication token found in session' });
    }
  
    const { owner, repo } = req.params;
    const octokit = new Octokit({
      auth: req.session.authToken
    });
    console.log('req.session.authToken', req.session.authToken)  
    try {
      const data = await octokit.activity.checkRepoIsStarredByAuthenticatedUser({
        owner,
        repo,
      });
      console.log('data in the backend', data)
      res.json({ isStarred: data.status === 204 });
    } catch (error) {
      if (error.status === 404) {
        res.json({ isStarred: false });
      } else {
        console.error('Failed to check star status:', error);
        res.status(500).json({ error: 'Failed to check star status' });
      }
    }
  });
  

  // Get repository details
router.get('/repo-details/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const octokit = new Octokit({ auth: req.session.authToken });

  try {
    const repoInfo = await octokit.repos.get({ owner, repo });
    const repoDetails = {
      fullName: repoInfo.data.full_name,
      description: repoInfo.data.description,
      starCount: repoInfo.data.stargazers_count,
      forkCount: repoInfo.data.forks_count,
      openIssuesCount: repoInfo.data.open_issues_count,
      htmlUrl: repoInfo.data.html_url,
    };
    res.json(repoDetails);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch repository details', error });
  }
});

  router.get('/readme/:owner/:repo', async (req, res) => {
    const { owner, repo } = req.params;
    const octokit = new Octokit({ auth: req.session.authToken });
  
    try {
      const readmeResponse = await octokit.repos.getContent({ owner, repo, path: 'README.md' });
      const markdown = Buffer.from(readmeResponse.data.content, 'base64').toString();
      res.json({ content: markdown });
    } catch (error) {
      res.status(500).json({ message: 'Failed to load README', error });
    }
  });

  router.post('/fork/:owner/:repo', async (req, res) => {
    if (!req.session || !req.session.authToken) {
      return res.status(401).send('Authentication required');
    }
  
    const octokit = new Octokit({ auth: req.session.authToken });
    const { owner, repo } = req.params;
  
    try {
      const response = await octokit.repos.createFork({
        owner,
        repo,
      });
      res.status(202).json(response.data);  // HTTP 202 Accepted for asynchronous fork operation
    } catch (error) {
      console.error('Failed to fork repository:', error);
      res.status(500).json({ message: 'Failed to fork repository', error });
    }
  });

  router.post('/issues/:owner/:repo', async (req, res) => {
    if (!req.session || !req.session.authToken) {
      return res.status(401).send('Authentication required');
    }
  
    const { owner, repo } = req.params;
    const { title, body } = req.body; // Expect title and body from the request body
  
    if (!title) {
      return res.status(400).send('Issue title is required');
    }
  
    const octokit = new Octokit({ auth: req.session.authToken });
  
    try {
      const issue = await octokit.issues.create({
        owner,
        repo,
        title,
        body,
      });
      res.json(issue.data);
    } catch (error) {
      console.error('Failed to create issue:', error);
      res.status(500).json({ message: 'Failed to create issue', error });
    }
  });
  
  router.put('/star/:owner/:repo', async (req, res) => {
    if (!req.session || !req.session.authToken) {
      return res.status(401).send('Authentication required');
    }
  
    const octokit = new Octokit({ auth: req.session.authToken });
    const { owner, repo } = req.params;
  
    try {
      await octokit.activity.starRepoForAuthenticatedUser({
        owner,
        repo,
      });
      res.status(204).send();  // HTTP 204 No Content for successful star operation
    } catch (error) {
      console.error('Failed to star repository:', error);
      res.status(500).json({ message: 'Failed to star repository', error });
    }
  });

  router.delete('/unstar/:owner/:repo', async (req, res) => {
    console.log('beginning of unstar');
    if (!req.session || !req.session.authToken) {
      return res.status(401).json({ error: 'No authentication token found in session' });
    }
  
    const octokit = new Octokit({ auth: req.session.authToken });
    const { owner, repo } = req.params;
    console.log('in unstar');
  
    try {
      await octokit.activity.unstarRepoForAuthenticatedUser({
        owner,
        repo,
      });
      console.log(`Successfully unstarred repository: ${owner}/${repo}`);
      res.status(204).send();
    } catch (error) {
      console.error(`Failed to unstar repository: ${owner}/${repo}`, error);
      res.status(500).json({ error: 'Failed to unstar repository' });
    }
  });


router.post('/push/:user/:repo', async (req, res) => {
  const { owner, repo, path, message, content, branch } = req.body;

  if (!req.session || !req.session.authToken) {
    return res.status(401).json({ error: 'No authentication token found in session' });
  }

  const octokit = new Octokit({ auth: req.session.authToken });

  try {
    // Get the current file content to get the SHA
    const { data: existingFile } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    // Update the file
    const { data: updateResponse } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha: existingFile.sha,
      branch,
    });

    console.log(`File updated successfully: ${updateResponse.commit.sha}`);
    return res.json({ success: true, commitSha: updateResponse.commit.sha });
  } catch (error) {
    if (error.status === 404) {
      try {
        // Create the file if it does not exist
        const { data: createResponse } = await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path,
          message,
          content: Buffer.from(content).toString('base64'),
          branch,
        });

        console.log(`File created successfully: ${createResponse.commit.sha}`);
        return res.json({ success: true, commitSha: createResponse.commit.sha });
      } catch (createError) {
        console.error(`Failed to create file: ${createError}`);
        return res.status(500).json({ error: 'Failed to create file', details: createError.message });
      }
    } else {
      console.error(`Failed to update file: ${error}`);
      return res.status(500).json({ error: 'Failed to update file', details: error.message });
    }
  }
});

  
  export default router;
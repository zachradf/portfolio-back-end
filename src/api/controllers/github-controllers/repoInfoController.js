import * as githubService from '../../services/github/githubServices.js';

const getRepoInfoController = {};

getRepoInfoController.listRepositories = async (req, res) => {
  const { authToken } = req.session;

  try {
    const data = await githubService.listRepositories(authToken);
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

getRepoInfoController.getDetails = async (req, res) => {
  const { owner, repo } = req.params;
  const { authToken } = req.session;

  try {
    const repoDetails = await githubService.getRepoDetails(
      owner,
      repo,
      authToken
    );
    res.json(repoDetails);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to fetch repository details', error });
  }
};

getRepoInfoController.getREADME = async (req, res) => {
  const { owner, repo } = req.params;
  const { authToken } = req.session;

  try {
    const markdown = await githubService.getREADME(owner, repo, authToken);
    console.log('markdown', markdown);
    res.json({ content: markdown });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load README', error });
  }
};

getRepoInfoController.checkStarred = async (req, res) => {
  const { owner, repo } = req.params;
  const { authToken } = req.session;

  try {
    const result = await githubService.checkStarred(owner, repo, authToken);
    res.json(result);
  } catch (error) {
    console.error('Failed to check star status:', error);
    res.status(500).json({ error: 'Failed to check star status' });
  }
};

getRepoInfoController.listForks = async (req, res) => {
  const { owner, repo } = req.params;
  const { authToken } = req.session;

  try {
    const forks = await githubService.listForks(owner, repo, authToken);
    res.json(forks);
  } catch (error) {
    console.error('Failed to list forks:', error);
    res.status(500).json({ error: 'Failed to list forks' });
  }
};

getRepoInfoController.listIssues = async (req, res) => {
  const { owner, repo } = req.params;
  const { authToken } = req.session;

  try {
    const data = await githubService.listIssues(owner, repo, authToken);
    console.log('in listIssues', data);
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

getRepoInfoController.getFileContent = async (req, res) => {
  const { owner, repo } = req.params;
  const { path, branch } = req.query;
  const { authToken } = req.session;
  console.log('all getFileContent args', owner, repo, path, branch, authToken);

  try {
    const data = await githubService.getFileContent(owner, repo, path, branch, authToken);
    console.log('data in getFileContent', data)
    const fileContent = Buffer.from(data.content, 'base64').toString('utf-8');
    console.log('fileContent in getFileContent', fileContent)

    res.json({ content: fileContent });
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ error: 'Error fetching file content' });
  }
};


//TODO UNCHECKED FUNCTION
getRepoInfoController.checkRepoOwnership = async (req, res) => {
  const { owner, repo } = req.params;
  const { authToken } = req.session;
  console.log('in check ownership', owner, repo, authToken, req.session.user);

  try {
    const result = await githubService.checkRepoOwnership(authToken);
    res.json(result);
  } catch (error) {
    console.error('Failed to check repository ownership:', error);
    res.status(500).json({ error: 'Failed to check repository ownership' });
  }
};

export default getRepoInfoController;

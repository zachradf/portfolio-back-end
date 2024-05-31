import * as githubService from '../../services/github/githubServices.js';

const repoActionsController = {};
repoActionsController.upsertFile = async (req, res) => {
  const { authToken } = req.session;
  const { owner, repo } = req.params;
  const { content, message, path, branch } = req.body;

  try {
    const data = await githubService.upsertFile(
      owner,
      repo,
      content,
      message,
      path,
      branch,
      authToken
    );
    console.log(`File updated successfully: ${data.content}`);
    return res.status(200).json({ message: 'File updated successfully', content: data.content });  
  } catch (error) {
    console.error(`Failed to update file: ${error}`);
    return res
      .status(500)
      .json({ error: 'Failed to update file', details: error.message });
  }
};

repoActionsController.createRepo = async (req, res) => {
  const { authToken } = req.session;
  const { name, description, privateRepo } = req.body;

  try {
    const data = await githubService.createRepo(
      name,
      description,
      privateRepo,
      authToken
    );
    res.json(data);
  } catch (error) {
    console.error('Failed to create repository:', error);
    res.status(500).json({ error: 'Failed to create repository' });
  }
};

repoActionsController.starRepo = async (req, res) => {
  const { owner, repo } = req.params;
  const { authToken } = req.session;

  try {
    await githubService.star(owner, repo, authToken);
    res.status(204).send(); // HTTP 204 No Content for successful star operation
  } catch (error) {
    console.error('Failed to star repository:', error);
    res.status(500).json({ message: 'Failed to star repository', error });
  }
};

repoActionsController.unstarRepo = async (req, res) => {
  const { owner, repo } = req.params;
  const { authToken } = req.session;

  try {
    await githubService.unStar(owner, repo, authToken);
    res.status(204).send();
  } catch (error) {
    console.error(`Failed to unstar repository: ${owner}/${repo}`, error);
    res.status(500).json({ error: 'Failed to unstar repository' });
  }
};

repoActionsController.submitIssue = async (req, res) => {
  const { owner, repo } = req.params;
  const { title, body } = req.body;
  const { authToken } = req.session;

  if (!title) {
    return res.status(400).send('Issue title is required');
  }

  try {
    const issue = await githubService.submitIssue(
      owner,
      repo,
      title,
      body,
      authToken
    );
    res.json(issue.data);
  } catch (error) {
    console.error('Failed to create issue:', error);
    res.status(500).json({ message: 'Failed to create issue', error });
  }
};

//TODO UNCHECKED FUNCTION
repoActionsController.createRepo = async (req, res) => {
  const { authToken } = req.session;
  const { name, description, privateRepo } = req.body;

  try {
    const data = await githubService.createRepo(
      name,
      description,
      privateRepo,
      authToken
    );
    res.json(data);
  } catch (error) {
    console.error('Failed to create repository:', error);
    res.status(500).json({ error: 'Failed to create repository' });
  }
};

//TODO UNCHECKED FUNCTION
repoActionsController.createPullRequest = async (req, res) => {
  const { owner, repo } = req.params;
  const { title, head, base, body } = req.body;
  const { authToken } = req.session;

  try {
    const data = await githubService.createPullRequest(
      owner,
      repo,
      title,
      head,
      base,
      body,
      authToken
    );
    res.json(data);
  } catch (error) {
    console.error('Failed to create pull request:', error);
    res.status(500).json({ error: 'Failed to create pull request' });
  }
};

export default repoActionsController;

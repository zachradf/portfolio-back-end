import axios from 'axios';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();
export const initiateOAuth = () => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.GITHUB_REDIRECT_URI);
  const githubAppAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
  return { url: githubAppAuthUrl };
};

export const exchangeCodeForToken = async (code, user) => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    },
    {
      headers: { Accept: 'application/json' },
    }
  );

  const { access_token } = response.data;
  return { access_token, user };
};

export const listRepositories = async (authToken) => {
  const octokit = new Octokit({ auth: authToken });
  const { data } = await octokit.repos.listForAuthenticatedUser({
    visibility: 'all',
    per_page: 100,
    page: 1,
  });
  return data;
};

export const checkStarred = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });

  try {
    const data = await octokit.activity.checkRepoIsStarredByAuthenticatedUser({
      owner,
      repo,
    });
    return { isStarred: data.status === 204 };
  } catch (error) {
    if (error.status === 404) {
      return { isStarred: false };
    }
    throw new Error('Failed to check star status');
  }
};

export const getRepoDetails = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  const repoInfo = await octokit.repos.get({ owner, repo });
  const repoDetails = {
    fullName: repoInfo.data.full_name,
    description: repoInfo.data.description,
    starCount: repoInfo.data.stargazers_count,
    forkCount: repoInfo.data.forks_count,
    openIssuesCount: repoInfo.data.open_issues_count,
    htmlUrl: repoInfo.data.html_url,
  };

  return repoDetails;
};

export const getREADME = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  const readmeResponse = await octokit.repos.getContent({
    owner,
    repo,
    path: 'README.md',
  });
  return Buffer.from(readmeResponse.data.content, 'base64').toString();
};

export const unStar = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  await octokit.activity.unstarRepoForAuthenticatedUser({
    owner,
    repo,
  });
};

export const star = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  await octokit.activity.starRepoForAuthenticatedUser({
    owner,
    repo,
  });
};

export const submitIssue = async (owner, repo, title, body, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  const issue = await octokit.issues.create({
    owner,
    repo,
    title,
    body,
  });

  return issue;
};

export const forkRepo = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  const response = await octokit.repos.createFork({
    owner,
    repo,
  });

  return response;
};
export const upsertFile = async (
  owner,
  repo,
  content,
  message,
  path,
  branch,
  authToken
) => {
  const octokit = new Octokit({ auth: authToken });

  try {
    // Try to get the current file content to get the SHA
    const { data: existingFile } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    // Update the file
    return await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha: existingFile.sha,
      branch,
    });
  } catch (error) {
    if (error.status === 404) {
      // File does not exist, create it
      return await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
      });
    } else {
      console.error('Error updating file:', error);
      throw new Error('Failed to updating file');
    }
  }
};
export const listForks = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  try {
    const { data } = await octokit.repos.listForks({
      owner,
      repo,
      per_page: 100,
      page: 1,
    });
    return data;
  } catch (error) {
    console.error('Error fetching forks:', error);
    throw new Error('Failed to list forks');
  }
};

export const listIssues = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'all',
    per_page: 100,
    page: 1,
  });
  return data;
};

export const checkRepoOwnership = async (authToken) => {
  const octokit = new Octokit({ auth: authToken });
  console.log('authtoken', authToken);
  const { data } = await octokit.rest.users.getAuthenticated();
  console.log('data', data);
  return data;
};

////NEW SERVICE FUNCTIONS
export const createRepo = async (name, description, privateRepo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  const { data } = await octokit.repos.createForAuthenticatedUser({
    name,
    description,
    private: privateRepo,
  });
  return data;
};

export const createPullRequest = async (
  owner,
  repo,
  title,
  head,
  base,
  body,
  authToken
) => {
  const octokit = new Octokit({ auth: authToken });
  const { data } = await octokit.pulls.create({
    owner,
    repo,
    title,
    head,
    base,
    body,
  });
  return data;
};

export const fetchFileContent = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });

  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  });

  return data;
};

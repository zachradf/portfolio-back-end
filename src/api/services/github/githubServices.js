import axios from "axios";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

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
    "https://github.com/login/oauth/access_token",
    {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    },
    {
      headers: { Accept: "application/json" },
    }
  );

  const { access_token } = response.data;
  return { access_token, user };
};

export const listRepositories = async (authToken) => {
  const octokit = new Octokit({ auth: authToken });
  const { data } = await octokit.repos.listForAuthenticatedUser({
    visibility: "all",
    per_page: 100,
    page: 1,
  });
  return data;
};

export const checkStarred = async (
  owner,
  repo,
  authToken,
) => {
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
    throw new Error("Failed to check star status");
  }
};


export const upsertRepo = async (req, res) => {
    const { path, message, content, branch } = req.body;
    const { owner, repo } = req.params;

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
            return await handleFileNotFound(octokit, owner, repo, path, message, content, branch, res);
        } else {
            console.error(`Failed to update file: ${error.message}`);
            return res.status(500).json({ error: 'Failed to update file', details: error.message });
        }
    }
};

const handleFileNotFound = async (octokit, owner, repo, path, message, content, branch, res) => {
    try {
        console.log('File not found, creating new file ','owner ', owner, 'repo', repo, 'path', path, 'message ', message, 'content ', content, 'branch ', branch );

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
        console.error(`Failed to create file: ${createError.message}`);
        return res.status(500).json({ error: 'Failed to create file', details: createError.message });
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

  return repoDetails
}

export const getREADME = async (owner, repo, authToken )=> {
    const octokit = new Octokit({ auth: authToken });
    const readmeResponse = await octokit.repos.getContent({ owner, repo, path: 'README.md' });
    return Buffer.from(readmeResponse.data.content, 'base64').toString();
}

export const unStar = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  await octokit.activity.unstarRepoForAuthenticatedUser({
    owner,
    repo,
  });
}

export const star = async(owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  await octokit.activity.starRepoForAuthenticatedUser({
      owner,
      repo,
    });
}

export const submitIssue = async(owner, repo, authToken, title, body) => {
  const octokit = new Octokit({ auth: authToken });
  const issue = await octokit.issues.create({
    owner,
    repo,
    title,
    body,
  });

  return issue;
}

export const forkRepo = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });
  // const { owner, repo } = req.params;
  const response = await octokit.repos.createFork({
    owner,
    repo,
  });

  return response
}
export const upsertFile = async (owner, repo, authToken, content, message, path, branch) => {
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
      state: "all",
      per_page: 100,
      page: 1,
    });
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

export const checkRepoOwnership = async (owner, repo, authToken) => {
  const octokit = new Octokit({ auth: authToken });

  try {
    const { data } = await octokit.repos.get({
      owner,
      repo,
    });

    return { isOwner: true, repo: data };
  } catch (error) {
    if (error.status === 404) {
      return { isOwner: false };
    }
    throw new Error("Failed to check repository ownership");
  }
};

export const createPullRequest = async (owner, repo, title, head, base, body, authToken) => {
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

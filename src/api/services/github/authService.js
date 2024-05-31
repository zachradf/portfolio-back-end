export const checkAuthToken = (req, res, next) => {
  if (!req.session || !req.session.authToken) {
    return res
      .status(401)
      .json({ error: 'No authentication token found in session' });
  }
  next();
};

export const checkOwnerAndRepo = (req, res, next) => {
  const { owner, repo } = req.params;

  if (!owner || !repo) {
    return res.status(400).send('Owner and Repo are required');
  }

  if (typeof owner !== 'string' || typeof repo !== 'string') {
    return res.status(400).send('Owner and Repo must be strings');
  }

  next();
};

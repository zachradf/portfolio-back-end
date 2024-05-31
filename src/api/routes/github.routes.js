import express from 'express';
import repoActionsController from '../controllers/github-controllers/repoActionsController.js';
import getRepoInfoController from '../controllers/github-controllers/repoInfoController.js';
import authController from '../controllers/github-controllers/authController.js';
import { checkAuthToken } from '../services/github/authService.js';
import { checkOwnerAndRepo } from '../services/github/authService.js';
const router = express.Router();

// Authentication routes
router.get('/initiate', authController.initiateOAuth);
router.post('/exchange-code', authController.exchangeCode);

// Get Repo Information
router.get(
  '/user/repos',
  checkAuthToken,
  getRepoInfoController.listRepositories
);
router.get(
  '/repo-details/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  getRepoInfoController.getDetails
);
router.get(
  '/is-starred/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  getRepoInfoController.checkStarred
);
router.get(
  '/readme/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  getRepoInfoController.getREADME
);
router.get(
  '/list-issues/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  getRepoInfoController.listIssues
);
router.get(
  '/list-forks/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  getRepoInfoController.listForks
);
router.get(
  '/check-ownership/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  getRepoInfoController.checkRepoOwnership
);
router.get('/file-content');

// Repo Actions
router.put(
  '/star/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  repoActionsController.starRepo
);
router.delete(
  '/unstar/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  repoActionsController.unstarRepo
);
router.post('/create-repo', checkAuthToken, repoActionsController.createRepo);
router.post(
  '/upsert-file/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  repoActionsController.upsertFile
);
router.post(
  '/submit-issue/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  repoActionsController.submitIssue
);
router.post(
  '/create-pull/:owner/:repo',
  checkAuthToken,
  checkOwnerAndRepo,
  repoActionsController.createPullRequest
);

export default router;



//   router.get('/user/repos', async (req, res) => {
//     const octokit = new Octokit({
//       auth: req.session.authToken
//     });
//     console.log('Fetching repositories...', req.session, req.session.authToken);
//     if (!req.session || !req.session.authToken) {
//       return res.status(401).json({ error: 'No authentication token found in session' });
//     }
    
//     try {
//       const { data } = await octokit.repos.listForAuthenticatedUser({
//         visibility: 'all', // This can be 'all', 'public', or 'private'
//         per_page: 100, // Adjust based on how many repos you want to fetch per page
//         page: 1 // For pagination
//       });
//       res.json(data);
//     } catch (error) {
//       console.error('Failed to fetch repositories:', error);
//       res.status(500).json({ error: 'Failed to fetch repositories' });
//     }
//   });


//   export default router;
import express from 'express';
import githubController from '../controllers/githubController.js';

const router = express.Router();

router.get('/initiate', githubController.initiateOAuth);
router.post('/exchange-code', githubController.exchangeCode);
router.get('/user/repos', githubController.listRepositories);
router.get('/is-starred/:owner/:repo', githubController.checkStarred);
router.get('/repo-details/:owner/:repo', githubController.getDetails)
router.get('/readme/:owner/:repo', githubController.getREADME)
router.put('/star/:owner/:repo', githubController.starRepo)
router.delete('/unstar/:owner/:repo', githubController.unstarRepo)
router.post('/submit-issue/:owner/:repo', githubController.submitIssue)
router.post('/fork-repo/:owner/:repo', githubController.forkRepo)
router.post('/push/:owner/:repo', githubController.pushCode)

export default router;

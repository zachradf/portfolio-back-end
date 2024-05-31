import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.user) {
    res.send({
      isAuthenticated: true,
      user: req.session.user,
    });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

export default router;

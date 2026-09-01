import express from 'express';

const router = express.Router();

// DEPRECATION STUB: Maintain /api/vault and /api/vault/messages returning 410 Gone with migration notice
router.use((req, res) => {
  res.status(410).json({
    message: 'This endpoint is deprecated and has been permanently removed. Please migrate to the nested shared team vault endpoints at /api/team/:teamId/vault',
    deprecatedEndpoint: req.originalUrl,
    replacementEndpoint: '/api/team/:teamId/vault',
  });
});

export default router;

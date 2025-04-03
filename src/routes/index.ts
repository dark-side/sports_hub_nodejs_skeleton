import express from 'express';
import authRoutes from './auth';
import articleRoutes from './articles';

const router = express.Router();

// Mount route groups
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);

export default router;

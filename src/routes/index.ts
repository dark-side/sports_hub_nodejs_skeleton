import express from 'express';
import authRoutes from './auth';
import articleRoutes from './articles';
import userRoutes from './users';
import registrationRoutes from './registrations';

const router = express.Router();

// Mount route groups
// Registration WITHOUT /api prefix (as per official spec)
router.use('/users', registrationRoutes);

// All other routes WITH /api prefix
router.use('/api/auth', authRoutes);
router.use('/api/articles', articleRoutes);
router.use('/api/users', userRoutes);

export default router;

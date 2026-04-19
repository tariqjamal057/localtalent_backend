import { Router } from 'express';
import categoryRouter from './category.route';
import packRouter from './pack.route';
import userProfileRouter from './user-profile.route';
import authRouter from './auth.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/categories', categoryRouter);
router.use('/packs', packRouter);
router.use('/user-profiles', userProfileRouter);

export default router;

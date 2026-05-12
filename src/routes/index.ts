import { Router } from 'express';
import categoryRouter from './category.route';
import packRouter from './pack.route';
import userProfileRouter from './user-profile.route';
import authRouter from './auth.route';
import adRouter from './ad.route';
import userReviewRouter from './user-review.route';
import userWalletRouter from './user-wallet.route';
import userBlockRouter from './user-block.route';
import matchRouter from './match.route';
import chatRouter from './chat.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/categories', categoryRouter);
router.use('/packs', packRouter);
router.use('/user-profiles', userProfileRouter);
router.use('/ads', adRouter);
router.use('/user-reviews', userReviewRouter);
router.use('/user-wallet', userWalletRouter);
router.use('/user-blocks', userBlockRouter);
router.use('/matches', matchRouter);
router.use('/chats', chatRouter);

export default router;

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
import translationRouter from './translation.route';
import appConstantRouter from './app-constant.route';
import callRouter from './call.route';
import paymentRouter from './payment.route';
import uploadRouter from './upload.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/categories', categoryRouter);
router.use('/packs', packRouter);
router.use('/user-profiles', userProfileRouter);
router.use('/ads', adRouter);
router.use('/user-review', userReviewRouter);
router.use('/user-wallet', userWalletRouter);
router.use('/user-blocks', userBlockRouter);
router.use('/matches', matchRouter);
router.use('/chats', chatRouter);
router.use('/translations', translationRouter);
router.use('/app-constants', appConstantRouter);
router.use('/call', callRouter)
router.use('/payment', paymentRouter)
router.use('/upload', uploadRouter)

export default router;

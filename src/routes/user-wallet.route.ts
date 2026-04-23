import { Router } from 'express';
import { userWalletController } from '../controllers/user-wallet.controller';
import authenticate from '../middleware/authenticate';

const router = Router();

router.get(
    '/match-count',
    authenticate,
    userWalletController.getAvailableMatchCount
);

export default router;

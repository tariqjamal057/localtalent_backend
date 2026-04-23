import { Router } from 'express';
import { matchController } from '../controllers/match.controller';
import authenticate from '../middleware/authenticate';

const router = Router();

router.get(
    '/',
    authenticate,
    matchController.getAcceptedMatches
);

export default router;

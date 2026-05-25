import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
    return res.json({
        multiLingualEnabled: true,
        internationalEnabled: false,
        resendOtpIntervalSeconds: 30,
    });
});

export default router;
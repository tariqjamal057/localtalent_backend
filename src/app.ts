import 'express-async-errors';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import config from './config';
import errorHandler from './middleware/errorHandler';
import routes from './routes';

const app: Express = express();

app.use(helmet());

app.use(
    cors({
        origin: config.corsOrigin,
        credentials: true,
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime())
    });
});

app.use('/api/v1', routes);

app.use((_req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Route not found',
        timestamp: new Date().toISOString(),
    });
});

app.use(errorHandler);

export default app;

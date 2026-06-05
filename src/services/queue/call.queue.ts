import { CALL_ENDED_BY } from "../../enums/call";
import { JOB_NAME } from "../../enums/jobs";
import { buildJobKey } from "../../utils/job";
import logger from "../../utils/logger";
import { callService } from "../call.service";
import { JobPayload, QueueService } from "./queue.service";

class CallQueue {
    private static queueService: QueueService;
    public static getInstance(): QueueService {
        if (!CallQueue.queueService) {
            CallQueue.queueService = QueueService.getInstance();
        }
        return CallQueue.queueService;
    }

    public static scheduleCallEnd(matchId: bigint, delayMs: number): void {
        logger.info(`Scheduling call end for matchId=${matchId} in ${delayMs} ms`);
        //currently, we are not scheduling call end using bullmq. We will uncomment below code and implement the worker to handle call end in future.
        // const jobKey = buildJobKey(JOB_NAME.END_CALL, matchId);
        // this.getInstance().addDelayedJob(jobKey, JOB_NAME.END_CALL, { matchId: matchId.toString() }, delayMs);
    }

    public static cancelScheduledCallEnd(matchId: string): void {
        const jobKey = buildJobKey(JOB_NAME.END_CALL, matchId);
        this.getInstance().removeJob(jobKey);
    }

    public static handleCallEndJob = async (job: JobPayload<{ matchId: string }>): Promise<void> => {
        const matchId = job.data?.matchId;
        if (!matchId) {
            logger.error('CallQueue: handleCallEndJob called with missing matchId in job data');
            return;
        }
        try {
            logger.info(`CallQueue: handling call end for matchId=${matchId}`);
            await callService.handleCallEnd({ matchId: BigInt(matchId), callEndBy: CALL_ENDED_BY.BULL_MQ_JOB });
            logger.info(`CallQueue: successfully ended call for matchId=${matchId}`);
        } catch (error) {
            logger.error(`CallQueue: error handling call end for matchId=${matchId}`, { error: error instanceof Error ? error.message : String(error) });
        }
    }
}

export default CallQueue;
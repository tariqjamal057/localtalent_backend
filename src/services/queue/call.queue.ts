import { JOB_NAME } from "../../enums/jobs";
import { buildJobKey } from "../../utils/job";
import logger from "../../utils/logger";
import { JobPayload, QueueService } from "./queue.service";

class CallQueue {
    private static queueService: QueueService;

    public static getInstance(): QueueService {
        if (!CallQueue.queueService) {
            CallQueue.queueService = QueueService.getInstance();
        }
        return CallQueue.queueService;
    }

    public static scheduleCallEnd(callId: string, delayMs: number): void {
        const jobKey = buildJobKey(JOB_NAME.END_CALL, callId);
        this.getInstance().addDelayedJob(jobKey, JOB_NAME.END_CALL, { callId }, delayMs);
    }

    public static cancelScheduledCallEnd(callId: string): void {
        const jobKey = buildJobKey(JOB_NAME.END_CALL, callId);
        this.getInstance().removeJob(jobKey);
    }

    public static handleCallEndJob = async (job: JobPayload<{ callId: string }>): Promise<void> => {
        const callId = job.data?.callId;
        if (!callId) {
            logger.error('CallQueue: missing callId in job data for endCall job');
            return;
        }
        logger.info(`Handling scheduled end call job for callId: ${callId}`);
    }
}

export default CallQueue;
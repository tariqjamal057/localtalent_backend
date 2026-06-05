import { JOB_NAME } from "../enums/jobs";

export const buildJobKey = (jobName: JOB_NAME, identifier: string | number | bigint) => {
    return `${jobName}-${identifier}`;
}
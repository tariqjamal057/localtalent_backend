export const getUserRoomId = (userId: bigint): string => {
    return `user:${userId}`;
}
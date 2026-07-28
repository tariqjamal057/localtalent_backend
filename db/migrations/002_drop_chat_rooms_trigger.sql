-- Drop the broken trigger that references updated_at on chat_rooms (which has no updated_at column)
DROP TRIGGER IF EXISTS trg_chat_rooms_updated_at ON chat_rooms;

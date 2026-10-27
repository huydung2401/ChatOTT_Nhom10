-- Migration 017: danh dau chua doc thu cong.
-- Chi THEM bang moi (khong ALTER bang cu). Kieu cot (text/timeuuid) can khop schema hien co:

-- Co "danh dau chua doc" thu cong cua tung nguoi dung.
CREATE TABLE IF NOT EXISTS manual_unread_by_user (
    user_id text,
    conversation_id text,
    marked_at timestamp,
    PRIMARY KEY ((user_id), conversation_id)
);

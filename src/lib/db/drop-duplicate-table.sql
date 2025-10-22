-- Drop duplicate bookmark table
-- This table is redundant as we use the unified 'bookmarks' table
-- Date: 2025.10.21

-- First check if table exists and has any data
SELECT
    'user_government_support_bookmarks' AS table_name,
    COUNT(*) AS record_count,
    'This table will be dropped' AS action
FROM user_government_support_bookmarks;

-- Drop the table if it exists (CASCADE will remove dependent objects if any)
DROP TABLE IF EXISTS user_government_support_bookmarks CASCADE;

-- Verify the table has been dropped
SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name = 'user_government_support_bookmarks';

-- Message to confirm
SELECT 'Table user_government_support_bookmarks has been successfully dropped.' AS result;
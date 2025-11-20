-- Add order column to tasks table for drag-and-drop sorting
ALTER TABLE tasks ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;

-- Create index for ordering
CREATE INDEX idx_tasks_display_order ON tasks(user_id, display_order);

-- Update existing tasks to have sequential order based on creation time
WITH ordered_tasks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
  FROM tasks
)
UPDATE tasks
SET display_order = ordered_tasks.row_num
FROM ordered_tasks
WHERE tasks.id = ordered_tasks.id;

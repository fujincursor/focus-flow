-- Update daily_summaries table to match Story 1.2 requirements
-- Add missing columns

ALTER TABLE daily_summaries
  ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS reflection_notes TEXT;

-- Rename columns to match Story requirements
ALTER TABLE daily_summaries
  RENAME COLUMN tasks_completed TO completed_tasks_count;

ALTER TABLE daily_summaries
  RENAME COLUMN tasks_created TO created_tasks_count;

ALTER TABLE daily_summaries
  RENAME COLUMN total_duration TO total_work_duration;

-- Add UPDATE policy for daily_summaries
CREATE POLICY "Users can update their own summaries"
  ON daily_summaries FOR UPDATE
  USING (auth.uid() = user_id);

-- Add DELETE policy for daily_summaries
CREATE POLICY "Users can delete their own summaries"
  ON daily_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- Update the trigger function to use new column names
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- When a task is completed, update the daily summary
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    INSERT INTO daily_summaries (user_id, date, completed_tasks_count, total_work_duration)
    VALUES (
      NEW.user_id,
      DATE(NEW.completed_at),
      1,
      COALESCE(NEW.estimated_duration, 0)
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
      completed_tasks_count = daily_summaries.completed_tasks_count + 1,
      total_work_duration = daily_summaries.total_work_duration + COALESCE(NEW.estimated_duration, 0),
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

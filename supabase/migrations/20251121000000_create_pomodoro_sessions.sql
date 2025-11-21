-- Create pomodoro_sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('work', 'rest')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER NOT NULL DEFAULT 0, -- 秒数
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_pomodoro_sessions_user_created
  ON pomodoro_sessions(user_id, created_at DESC);

CREATE INDEX idx_pomodoro_sessions_task
  ON pomodoro_sessions(task_id)
  WHERE task_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own pomodoro sessions"
  ON pomodoro_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions"
  ON pomodoro_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro sessions"
  ON pomodoro_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro sessions"
  ON pomodoro_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON pomodoro_sessions TO authenticated;
GRANT ALL ON pomodoro_sessions TO service_role;

-- Add comment
COMMENT ON TABLE pomodoro_sessions IS 'Stores completed and in-progress pomodoro timer sessions';

-- ================================================
-- RUNNING MODULE - MIGRATION
-- ================================================

-- Create runs table
CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  distance DECIMAL(10,2) NOT NULL, -- in kilometers
  duration INTEGER NOT NULL, -- in minutes
  run_date DATE NOT NULL,
  pace DECIMAL(10,2), -- min/km calculated
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_runs_user ON runs(user_id);
CREATE INDEX idx_runs_date ON runs(run_date);

-- Enable RLS
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own runs" ON runs
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own runs" ON runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own runs" ON runs
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own runs" ON runs
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_runs_updated_at BEFORE UPDATE ON runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

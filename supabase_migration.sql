-- ================================================
-- WAYNE PRODUCTIVITY SYSTEM - SUPABASE MIGRATION
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- HABITS TABLE
-- ================================================

CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly')) DEFAULT 'daily',
  category TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_habits_user ON habits(user_id);

-- ================================================
-- HABIT CHECK-INS TABLE
-- ================================================

CREATE TABLE habit_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_checkin UNIQUE(habit_id, completed_date)
);

CREATE INDEX idx_checkins_habit ON habit_checkins(habit_id);
CREATE INDEX idx_checkins_date ON habit_checkins(completed_date);
CREATE INDEX idx_checkins_user ON habit_checkins(user_id);

-- ================================================
-- WORKOUTS TABLE
-- ================================================

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  day_of_week TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workouts_user ON workouts(user_id);

-- ================================================
-- WORKOUT LOGS TABLE
-- ================================================

CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_name TEXT NOT NULL,
  exercises_performed JSONB NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_logs_user ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_date ON workout_logs(completed_at);

-- ================================================
-- APPOINTMENTS TABLE
-- ================================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  category TEXT,
  color TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_time ON appointments(start_time);

-- ================================================
-- TRANSACTIONS TABLE
-- ================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Habits policies
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Habit checkins policies
CREATE POLICY "Users can view own checkins" ON habit_checkins
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own checkins" ON habit_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own checkins" ON habit_checkins
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own checkins" ON habit_checkins
  FOR DELETE USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Workout logs policies
CREATE POLICY "Users can view own workout logs" ON workout_logs
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own workout logs" ON workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own workout logs" ON workout_logs
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own workout logs" ON workout_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

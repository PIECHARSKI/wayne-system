-- ================================================
-- VISION BOARD MODULE - DATABASE MIGRATION
-- ================================================

-- Vision Items Table
CREATE TABLE vision_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vision_items_user ON vision_items(user_id);
CREATE INDEX idx_vision_items_order ON vision_items(user_id, display_order);

-- Enable RLS
ALTER TABLE vision_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own vision items" ON vision_items
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own vision items" ON vision_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own vision items" ON vision_items
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own vision items" ON vision_items
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_vision_items_updated_at BEFORE UPDATE ON vision_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

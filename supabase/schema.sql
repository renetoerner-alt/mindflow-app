-- =============================================
-- MINDFLOW - Supabase Database Schema
-- Mit mf_ Prefix um Konflikte mit ImmoHub zu vermeiden
-- =============================================

-- Enable UUID extension (falls noch nicht aktiv)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES (alle mit mf_ Prefix)
-- =============================================

-- Priorities (P1-P5)
CREATE TABLE mf_priorities (
  level INTEGER PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Status Options
CREATE TABLE mf_status_options (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Categories (Arbeit, Privat, Finanzen, Gesundheit)
CREATE TABLE mf_categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action Types (Gespräch, E-Mail, Prüfen, etc.)
CREATE TABLE mf_action_types (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Persons (@Sarah, @Thomas, etc.)
CREATE TABLE mf_persons (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  department TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings (#Daily Standup, #Team Weekly, etc.)
CREATE TABLE mf_meetings (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  rhythm TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Todos (Main table)
CREATE TABLE mf_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER REFERENCES mf_priorities(level) DEFAULT 3,
  category TEXT REFERENCES mf_categories(id),
  action_type TEXT,
  status TEXT REFERENCES mf_status_options(id) DEFAULT 'offen',
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  sync_to_calendar BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: Todos <-> Persons (many-to-many)
CREATE TABLE mf_todo_persons (
  todo_id UUID REFERENCES mf_todos(id) ON DELETE CASCADE,
  person_id TEXT REFERENCES mf_persons(id) ON DELETE CASCADE,
  PRIMARY KEY (todo_id, person_id)
);

-- Junction table: Todos <-> Meetings (many-to-many)
CREATE TABLE mf_todo_meetings (
  todo_id UUID REFERENCES mf_todos(id) ON DELETE CASCADE,
  meeting_id TEXT REFERENCES mf_meetings(id) ON DELETE CASCADE,
  PRIMARY KEY (todo_id, meeting_id)
);

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Insert default priorities
INSERT INTO mf_priorities (level, label, color) VALUES
  (1, 'Kritisch', '#FF6B9D'),
  (2, 'Hoch', '#FDBA74'),
  (3, 'Mittel', '#67E8F9'),
  (4, 'Niedrig', '#BFFF00'),
  (5, 'Minimal', '#C4B5FD');

-- Insert default status options
INSERT INTO mf_status_options (id, label, color) VALUES
  ('offen', 'Offen', '#22c55e'),
  ('in_bearbeitung', 'In Bearbeitung', '#3b82f6'),
  ('warten', 'Auf Rückmeldung', '#eab308'),
  ('erledigt', 'Erledigt', '#9ca3af');

-- Insert default categories
INSERT INTO mf_categories (id, label, color, is_default) VALUES
  ('arbeit', 'Arbeit', '#C4B5FD', true),
  ('privat', 'Privat', '#FF6B9D', true),
  ('finanzen', 'Finanzen', '#BFFF00', true),
  ('gesundheit', 'Gesundheit', '#67E8F9', true);

-- Insert default action types
INSERT INTO mf_action_types (id, label, icon, is_default) VALUES
  ('gespraech', 'Gespräch', 'chat', true),
  ('email', 'E-Mail', 'email', true),
  ('pruefen', 'Prüfen', 'check', true),
  ('dokument', 'Dokument', 'document', true),
  ('recherche', 'Recherche', 'search', true),
  ('termin', 'Termin', 'calendar', true),
  ('anruf', 'Anruf', 'phone', true),
  ('entscheidung', 'Entscheidung', 'decision', true);

-- Insert default persons
INSERT INTO mf_persons (id, name, department, is_default) VALUES
  ('sarah', 'Sarah', 'Marketing', true),
  ('thomas', 'Thomas', 'Finanzen', true),
  ('michael', 'Michael', 'Entwicklung', true),
  ('lisa', 'Lisa', 'Vertrieb', true),
  ('anna', 'Anna', 'HR', true);

-- Insert default meetings
INSERT INTO mf_meetings (id, name, rhythm, is_default) VALUES
  ('daily', 'Daily Standup', 'Täglich', true),
  ('weekly', 'Team Weekly', 'Wöchentlich', true),
  ('quarterly', 'Quartalsreview', 'Vierteljährlich', true);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all user-specific tables
ALTER TABLE mf_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mf_todo_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE mf_todo_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mf_action_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE mf_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE mf_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mf_categories ENABLE ROW LEVEL SECURITY;

-- Todos: Users can only see/modify their own todos
CREATE POLICY "Users can view own todos" ON mf_todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON mf_todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON mf_todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON mf_todos
  FOR DELETE USING (auth.uid() = user_id);

-- Todo_persons: Access through todo ownership
CREATE POLICY "Users can manage todo_persons" ON mf_todo_persons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM mf_todos WHERE mf_todos.id = mf_todo_persons.todo_id AND mf_todos.user_id = auth.uid())
  );

-- Todo_meetings: Access through todo ownership
CREATE POLICY "Users can manage todo_meetings" ON mf_todo_meetings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM mf_todos WHERE mf_todos.id = mf_todo_meetings.todo_id AND mf_todos.user_id = auth.uid())
  );

-- Action types: Users see defaults + their own
CREATE POLICY "Users can view action_types" ON mf_action_types
  FOR SELECT USING (is_default = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own action_types" ON mf_action_types
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own action_types" ON mf_action_types
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own action_types" ON mf_action_types
  FOR DELETE USING (auth.uid() = user_id);

-- Persons: Users see defaults + their own
CREATE POLICY "Users can view persons" ON mf_persons
  FOR SELECT USING (is_default = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own persons" ON mf_persons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own persons" ON mf_persons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own persons" ON mf_persons
  FOR DELETE USING (auth.uid() = user_id);

-- Meetings: Users see defaults + their own
CREATE POLICY "Users can view meetings" ON mf_meetings
  FOR SELECT USING (is_default = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own meetings" ON mf_meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings" ON mf_meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings" ON mf_meetings
  FOR DELETE USING (auth.uid() = user_id);

-- Categories: Users see defaults + their own
CREATE POLICY "Users can view categories" ON mf_categories
  FOR SELECT USING (is_default = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own categories" ON mf_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION mf_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mf_todos_updated_at
  BEFORE UPDATE ON mf_todos
  FOR EACH ROW
  EXECUTE FUNCTION mf_update_updated_at();

-- Set completed_at when todo is completed
CREATE OR REPLACE FUNCTION mf_set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND OLD.completed = false THEN
    NEW.completed_at = NOW();
  ELSIF NEW.completed = false THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mf_todos_completed_at
  BEFORE UPDATE ON mf_todos
  FOR EACH ROW
  EXECUTE FUNCTION mf_set_completed_at();

-- =============================================
-- INDEXES for better performance
-- =============================================

CREATE INDEX idx_mf_todos_user_id ON mf_todos(user_id);
CREATE INDEX idx_mf_todos_completed ON mf_todos(completed);
CREATE INDEX idx_mf_todos_due_date ON mf_todos(due_date);
CREATE INDEX idx_mf_todos_priority ON mf_todos(priority);
CREATE INDEX idx_mf_todos_status ON mf_todos(status);
CREATE INDEX idx_mf_todo_persons_todo_id ON mf_todo_persons(todo_id);
CREATE INDEX idx_mf_todo_meetings_todo_id ON mf_todo_meetings(todo_id);

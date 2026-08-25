-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  accent_color TEXT NOT NULL DEFAULT '#3b82f6',
  theme_mode TEXT NOT NULL DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark')),
  body_weight_kg NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Movements
CREATE TABLE movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  primary_muscles TEXT[] NOT NULL DEFAULT '{}',
  secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Programs
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rotation_type TEXT NOT NULL DEFAULT 'sequential' CHECK (rotation_type IN ('sequential', 'weekly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Program days
CREATE TABLE program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_order INT NOT NULL,
  label TEXT NOT NULL,
  UNIQUE (program_id, day_order)
);

-- Program day exercises
CREATE TABLE program_day_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_day_id UUID NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
  movement_id UUID NOT NULL REFERENCES movements(id) ON DELETE RESTRICT,
  target_sets INT NOT NULL DEFAULT 3,
  target_reps INT NOT NULL DEFAULT 8,
  target_rir NUMERIC NOT NULL DEFAULT 2,
  exercise_order INT NOT NULL DEFAULT 0
);

-- Workout sessions
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  program_day_id UUID REFERENCES program_days(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed'))
);

-- Session sets
CREATE TABLE session_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  movement_id UUID NOT NULL REFERENCES movements(id) ON DELETE RESTRICT,
  set_number INT NOT NULL,
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  reps INT NOT NULL DEFAULT 0,
  rir NUMERIC NOT NULL DEFAULT 2,
  rest_seconds INT
);

-- Body weight logs
CREATE TABLE body_weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC NOT NULL,
  logged_on DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, logged_on)
);

-- Indexes
CREATE INDEX idx_programs_user ON programs(user_id);
CREATE INDEX idx_workout_sessions_user ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX idx_session_sets_session ON session_sets(session_id);
CREATE INDEX idx_body_weight_logs_user ON body_weight_logs(user_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_day_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Movements policies (system + own)
CREATE POLICY "Anyone can view system movements" ON movements FOR SELECT USING (is_system = TRUE OR auth.uid() = user_id);
CREATE POLICY "Users can insert own movements" ON movements FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = FALSE);
CREATE POLICY "Users can update own movements" ON movements FOR UPDATE USING (auth.uid() = user_id AND is_system = FALSE);
CREATE POLICY "Users can delete own movements" ON movements FOR DELETE USING (auth.uid() = user_id AND is_system = FALSE);

-- Programs policies
CREATE POLICY "Users manage own programs" ON programs FOR ALL USING (auth.uid() = user_id);

-- Program days (via program ownership)
CREATE POLICY "Users manage own program days" ON program_days FOR ALL
  USING (EXISTS (SELECT 1 FROM programs p WHERE p.id = program_id AND p.user_id = auth.uid()));

-- Program day exercises
CREATE POLICY "Users manage own program day exercises" ON program_day_exercises FOR ALL
  USING (EXISTS (
    SELECT 1 FROM program_days pd
    JOIN programs p ON p.id = pd.program_id
    WHERE pd.id = program_day_id AND p.user_id = auth.uid()
  ));

-- Workout sessions
CREATE POLICY "Users manage own sessions" ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- Session sets (via session ownership)
CREATE POLICY "Users manage own session sets" ON session_sets FOR ALL
  USING (EXISTS (SELECT 1 FROM workout_sessions ws WHERE ws.id = session_id AND ws.user_id = auth.uid()));

-- Body weight logs
CREATE POLICY "Users manage own weight logs" ON body_weight_logs FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed system movements
INSERT INTO movements (name, primary_muscles, secondary_muscles, category, is_system) VALUES
  ('Barbell Back Squat', ARRAY['quads', 'glutes'], ARRAY['hamstrings', 'core'], 'compound', TRUE),
  ('Barbell Front Squat', ARRAY['quads', 'core'], ARRAY['glutes'], 'compound', TRUE),
  ('Barbell Bench Press', ARRAY['chest'], ARRAY['triceps', 'shoulders'], 'compound', TRUE),
  ('Incline Bench Press', ARRAY['chest'], ARRAY['shoulders', 'triceps'], 'compound', TRUE),
  ('Barbell Deadlift', ARRAY['hamstrings', 'glutes', 'back'], ARRAY['core'], 'compound', TRUE),
  ('Romanian Deadlift', ARRAY['hamstrings', 'glutes'], ARRAY['back'], 'compound', TRUE),
  ('Overhead Press', ARRAY['shoulders'], ARRAY['triceps', 'core'], 'compound', TRUE),
  ('Barbell Row', ARRAY['back'], ARRAY['biceps', 'core'], 'compound', TRUE),
  ('Pull-Up', ARRAY['back'], ARRAY['biceps'], 'compound', TRUE),
  ('Chin-Up', ARRAY['back', 'biceps'], ARRAY['forearms'], 'compound', TRUE),
  ('Dip', ARRAY['chest', 'triceps'], ARRAY['shoulders'], 'compound', TRUE),
  ('Leg Press', ARRAY['quads', 'glutes'], ARRAY['hamstrings'], 'compound', TRUE),
  ('Hip Thrust', ARRAY['glutes'], ARRAY['hamstrings'], 'compound', TRUE),
  ('Lunge', ARRAY['quads', 'glutes'], ARRAY['hamstrings'], 'compound', TRUE),
  ('Bulgarian Split Squat', ARRAY['quads', 'glutes'], ARRAY['hamstrings'], 'compound', TRUE),
  ('Lat Pulldown', ARRAY['back'], ARRAY['biceps'], 'isolation', TRUE),
  ('Cable Row', ARRAY['back'], ARRAY['biceps'], 'isolation', TRUE),
  ('Dumbbell Curl', ARRAY['biceps'], ARRAY['forearms'], 'isolation', TRUE),
  ('Hammer Curl', ARRAY['biceps', 'forearms'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Tricep Pushdown', ARRAY['triceps'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Skull Crusher', ARRAY['triceps'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Lateral Raise', ARRAY['shoulders'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Face Pull', ARRAY['shoulders', 'back'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Leg Curl', ARRAY['hamstrings'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Leg Extension', ARRAY['quads'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Calf Raise', ARRAY['calves'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Plank', ARRAY['core'], ARRAY['shoulders'], 'isolation', TRUE),
  ('Cable Crunch', ARRAY['core'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Dumbbell Bench Press', ARRAY['chest'], ARRAY['triceps', 'shoulders'], 'compound', TRUE),
  ('Dumbbell Shoulder Press', ARRAY['shoulders'], ARRAY['triceps'], 'compound', TRUE),
  ('Goblet Squat', ARRAY['quads', 'glutes'], ARRAY['core'], 'compound', TRUE),
  ('Sumo Deadlift', ARRAY['glutes', 'hamstrings', 'quads'], ARRAY['back'], 'compound', TRUE),
  ('Pendlay Row', ARRAY['back'], ARRAY['biceps'], 'compound', TRUE),
  ('Seated Cable Row', ARRAY['back'], ARRAY['biceps'], 'isolation', TRUE),
  ('Preacher Curl', ARRAY['biceps'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Incline Dumbbell Curl', ARRAY['biceps'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Overhead Tricep Extension', ARRAY['triceps'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Reverse Fly', ARRAY['shoulders', 'back'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Shrugs', ARRAY['traps'], ARRAY[]::TEXT[], 'isolation', TRUE),
  ('Hack Squat', ARRAY['quads', 'glutes'], ARRAY['hamstrings'], 'compound', TRUE),
  ('Good Morning', ARRAY['hamstrings', 'back'], ARRAY['glutes'], 'compound', TRUE),
  ('Push-Up', ARRAY['chest'], ARRAY['triceps', 'core'], 'compound', TRUE),
  ('Farmer Walk', ARRAY['forearms', 'core'], ARRAY['traps'], 'compound', TRUE);

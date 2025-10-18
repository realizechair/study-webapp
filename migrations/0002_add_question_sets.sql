-- Question Sets table (to group questions by Excel file)
CREATE TABLE IF NOT EXISTS question_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add set_id column to questions table
ALTER TABLE questions ADD COLUMN set_id INTEGER REFERENCES question_sets(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_questions_set_id ON questions(set_id);

-- Migrate existing questions to a default set
INSERT INTO question_sets (name, description) VALUES ('デフォルト問題セット', 'インポート前の既存問題');

-- Update existing questions to belong to the default set
UPDATE questions SET set_id = 1 WHERE set_id IS NULL;

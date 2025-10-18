-- Add categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add category_id to question_sets
ALTER TABLE question_sets ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS idx_question_sets_category_id ON question_sets(category_id);

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES 
  ('未分類', 'カテゴリー未設定の問題セット', '#6B7280'),
  ('資格試験', '各種資格試験の問題', '#3B82F6'),
  ('語学学習', '外国語や言語学習の問題', '#10B981'),
  ('プログラミング', 'プログラミング関連の問題', '#F59E0B'),
  ('一般教養', '一般常識や教養問題', '#8B5CF6');

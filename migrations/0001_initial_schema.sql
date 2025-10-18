-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  no INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  difficulty TEXT CHECK(difficulty IN ('A', 'B', 'C')) NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Learning history table
CREATE TABLE IF NOT EXISTS learning_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  is_correct INTEGER CHECK(is_correct IN (0, 1)) NOT NULL,
  attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Question statistics view (for quick access to stats)
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_no ON questions(no);
CREATE INDEX IF NOT EXISTS idx_learning_history_question_id ON learning_history(question_id);
CREATE INDEX IF NOT EXISTS idx_learning_history_attempted_at ON learning_history(attempted_at);

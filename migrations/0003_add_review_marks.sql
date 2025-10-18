-- Review marks table (user-marked questions for review)
CREATE TABLE IF NOT EXISTS review_marks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE(question_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_review_marks_question_id ON review_marks(question_id);
CREATE INDEX IF NOT EXISTS idx_review_marks_marked_at ON review_marks(marked_at);

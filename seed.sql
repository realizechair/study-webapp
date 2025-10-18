-- Sample questions for testing
INSERT OR IGNORE INTO questions (no, question_text, difficulty, answer, explanation) VALUES 
  (1, 'JavaScriptは静的型付け言語である。', 'A', '×', 'JavaScriptは動的型付け言語です。変数の型は実行時に決定されます。'),
  (2, 'Honoは軽量なWeb フレームワークである。', 'A', '○', 'Honoは高速で軽量なWebフレームワークで、Cloudflare Workersなどのエッジ環境で動作します。'),
  (3, 'Cloudflare Workersではファイルシステムにアクセスできる。', 'B', '×', 'Cloudflare Workersはエッジランタイムのため、ファイルシステムへのアクセスはできません。'),
  (4, 'D1はCloudflareが提供するSQLiteベースのデータベースである。', 'B', '○', 'D1はCloudflareのグローバル分散SQLiteデータベースサービスです。'),
  (5, 'TypeScriptはJavaScriptのスーパーセットである。', 'A', '○', 'TypeScriptはJavaScriptに型システムを追加した言語で、JavaScriptのスーパーセットです。');

-- Sample learning history
INSERT OR IGNORE INTO learning_history (question_id, is_correct) VALUES 
  (1, 1),
  (1, 0),
  (2, 1),
  (3, 0);

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== API Routes ====================

// Get all questions with optional filters
app.get('/api/questions', async (c) => {
  const { env } = c;
  const difficulty = c.req.query('difficulty');
  const limit = c.req.query('limit') || '100';
  
  let query = 'SELECT * FROM questions';
  const params: string[] = [];
  
  if (difficulty && ['A', 'B', 'C'].includes(difficulty)) {
    query += ' WHERE difficulty = ?';
    params.push(difficulty);
  }
  
  query += ' ORDER BY no ASC LIMIT ?';
  params.push(limit);
  
  const result = await env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: result.results });
});

// Get single question by ID
app.get('/api/questions/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');
  
  const result = await env.DB.prepare('SELECT * FROM questions WHERE id = ?').bind(id).first();
  
  if (!result) {
    return c.json({ success: false, error: 'Question not found' }, 404);
  }
  
  return c.json({ success: true, data: result });
});

// Get random questions
app.get('/api/questions/random/:count', async (c) => {
  const { env } = c;
  const count = parseInt(c.req.param('count')) || 10;
  const difficulty = c.req.query('difficulty');
  
  let query = 'SELECT * FROM questions';
  const params: string[] = [];
  
  if (difficulty && ['A', 'B', 'C'].includes(difficulty)) {
    query += ' WHERE difficulty = ?';
    params.push(difficulty);
  }
  
  query += ' ORDER BY RANDOM() LIMIT ?';
  params.push(count.toString());
  
  const result = await env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: result.results });
});

// Get questions for review (based on incorrect answers)
app.get('/api/questions/review', async (c) => {
  const { env } = c;
  const limit = c.req.query('limit') || '20';
  
  const query = `
    SELECT DISTINCT q.*, 
           COUNT(lh.id) as attempt_count,
           SUM(CASE WHEN lh.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
           MAX(lh.attempted_at) as last_attempted
    FROM questions q
    LEFT JOIN learning_history lh ON q.id = lh.question_id
    WHERE lh.id IS NOT NULL
    GROUP BY q.id
    HAVING correct_count < attempt_count
    ORDER BY last_attempted DESC, attempt_count DESC
    LIMIT ?
  `;
  
  const result = await env.DB.prepare(query).bind(limit).all();
  return c.json({ success: true, data: result.results });
});

// Create new question
app.post('/api/questions', async (c) => {
  const { env } = c;
  const body = await c.req.json();
  const { no, question_text, difficulty, answer, explanation } = body;
  
  if (!no || !question_text || !difficulty || !answer) {
    return c.json({ success: false, error: 'Missing required fields' }, 400);
  }
  
  if (!['A', 'B', 'C'].includes(difficulty)) {
    return c.json({ success: false, error: 'Invalid difficulty level' }, 400);
  }
  
  const result = await env.DB.prepare(
    'INSERT INTO questions (no, question_text, difficulty, answer, explanation) VALUES (?, ?, ?, ?, ?)'
  ).bind(no, question_text, difficulty, answer, explanation || '').run();
  
  return c.json({ success: true, data: { id: result.meta.last_row_id } });
});

// Update question
app.put('/api/questions/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');
  const body = await c.req.json();
  const { no, question_text, difficulty, answer, explanation } = body;
  
  if (!no || !question_text || !difficulty || !answer) {
    return c.json({ success: false, error: 'Missing required fields' }, 400);
  }
  
  if (!['A', 'B', 'C'].includes(difficulty)) {
    return c.json({ success: false, error: 'Invalid difficulty level' }, 400);
  }
  
  const result = await env.DB.prepare(
    'UPDATE questions SET no = ?, question_text = ?, difficulty = ?, answer = ?, explanation = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(no, question_text, difficulty, answer, explanation || '', id).run();
  
  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Question not found' }, 404);
  }
  
  return c.json({ success: true });
});

// Delete question
app.delete('/api/questions/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');
  
  const result = await env.DB.prepare('DELETE FROM questions WHERE id = ?').bind(id).run();
  
  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Question not found' }, 404);
  }
  
  return c.json({ success: true });
});

// Import questions from JSON (bulk insert)
app.post('/api/questions/import', async (c) => {
  const { env } = c;
  const body = await c.req.json();
  const { questions, replace } = body;
  
  if (!Array.isArray(questions) || questions.length === 0) {
    return c.json({ success: false, error: 'Invalid questions data' }, 400);
  }
  
  try {
    // If replace is true, delete all existing questions
    if (replace) {
      await env.DB.prepare('DELETE FROM questions').run();
    }
    
    // Insert all questions
    let successCount = 0;
    for (const q of questions) {
      if (!q.no || !q.question_text || !q.difficulty || !q.answer) {
        continue; // Skip invalid questions
      }
      
      await env.DB.prepare(
        'INSERT INTO questions (no, question_text, difficulty, answer, explanation) VALUES (?, ?, ?, ?, ?)'
      ).bind(q.no, q.question_text, q.difficulty, q.answer, q.explanation || '').run();
      
      successCount++;
    }
    
    return c.json({ success: true, imported: successCount, total: questions.length });
  } catch (error) {
    return c.json({ success: false, error: 'Import failed: ' + String(error) }, 500);
  }
});

// Export all questions to JSON
app.get('/api/questions/export', async (c) => {
  const { env } = c;
  
  const result = await env.DB.prepare('SELECT * FROM questions ORDER BY no ASC').all();
  
  return c.json({ success: true, data: result.results });
});

// Record learning attempt
app.post('/api/learning/record', async (c) => {
  const { env } = c;
  const body = await c.req.json();
  const { question_id, is_correct } = body;
  
  if (!question_id || is_correct === undefined) {
    return c.json({ success: false, error: 'Missing required fields' }, 400);
  }
  
  const result = await env.DB.prepare(
    'INSERT INTO learning_history (question_id, is_correct) VALUES (?, ?)'
  ).bind(question_id, is_correct ? 1 : 0).run();
  
  return c.json({ success: true, data: { id: result.meta.last_row_id } });
});

// Get learning statistics
app.get('/api/learning/stats', async (c) => {
  const { env } = c;
  
  const query = `
    SELECT 
      COUNT(DISTINCT question_id) as total_questions_attempted,
      COUNT(*) as total_attempts,
      SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
      ROUND(CAST(SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as accuracy_rate
    FROM learning_history
  `;
  
  const result = await env.DB.prepare(query).first();
  return c.json({ success: true, data: result });
});

// Get question statistics (per question)
app.get('/api/learning/question-stats/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');
  
  const query = `
    SELECT 
      question_id,
      COUNT(*) as attempt_count,
      SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
      MAX(attempted_at) as last_attempted
    FROM learning_history
    WHERE question_id = ?
    GROUP BY question_id
  `;
  
  const result = await env.DB.prepare(query).bind(id).first();
  
  if (!result) {
    return c.json({ success: true, data: { attempt_count: 0, correct_count: 0 } });
  }
  
  return c.json({ success: true, data: result });
});

// Get difficulty-based statistics
app.get('/api/learning/difficulty-stats', async (c) => {
  const { env } = c;
  
  const query = `
    SELECT 
      q.difficulty,
      COUNT(DISTINCT q.id) as question_count,
      COUNT(lh.id) as total_attempts,
      SUM(CASE WHEN lh.is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
      ROUND(CAST(SUM(CASE WHEN lh.is_correct = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(lh.id) * 100, 2) as accuracy_rate
    FROM questions q
    LEFT JOIN learning_history lh ON q.id = lh.question_id
    GROUP BY q.difficulty
    ORDER BY q.difficulty ASC
  `;
  
  const result = await env.DB.prepare(query).all();
  return c.json({ success: true, data: result.results });
});

// ==================== Frontend Route ====================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>学習アプリ - 問題管理システム</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
    </head>
    <body class="bg-gray-50">
        <div id="app" class="min-h-screen">
            <!-- Content will be loaded by app.js -->
            <div class="flex items-center justify-center h-screen">
                <div class="text-center">
                    <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
                    <p class="text-gray-600">読み込み中...</p>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app

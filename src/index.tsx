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

// ==================== Categories API ====================

// Get all categories
app.get('/api/categories', async (c) => {
  const { env } = c;
  
  const result = await env.DB.prepare(`
    SELECT c.*, COUNT(qs.id) as set_count
    FROM categories c
    LEFT JOIN question_sets qs ON c.id = qs.category_id
    GROUP BY c.id
    ORDER BY c.created_at ASC
  `).all();
  
  return c.json({ success: true, data: result.results });
});

// Create category
app.post('/api/categories', async (c) => {
  const { env } = c;
  const body = await c.req.json();
  const { name, description, color } = body;
  
  if (!name) {
    return c.json({ success: false, error: 'Name is required' }, 400);
  }
  
  const result = await env.DB.prepare(
    'INSERT INTO categories (name, description, color) VALUES (?, ?, ?)'
  ).bind(name, description || '', color || '#3B82F6').run();
  
  return c.json({ success: true, data: { id: result.meta.last_row_id } });
});

// Update category
app.put('/api/categories/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');
  const body = await c.req.json();
  const { name, description, color } = body;
  
  if (!name) {
    return c.json({ success: false, error: 'Name is required' }, 400);
  }
  
  const result = await env.DB.prepare(
    'UPDATE categories SET name = ?, description = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(name, description || '', color || '#3B82F6', id).run();
  
  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Category not found' }, 404);
  }
  
  return c.json({ success: true });
});

// Delete category
app.delete('/api/categories/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');
  
  // Cannot delete default category (id=1)
  if (id === '1') {
    return c.json({ success: false, error: 'Cannot delete default category' }, 400);
  }
  
  const result = await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  
  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Category not found' }, 404);
  }
  
  return c.json({ success: true });
});

// ==================== Question Sets API ====================

// Get all question sets
app.get('/api/question-sets', async (c) => {
  const { env } = c;
  const categoryId = c.req.query('category_id');
  
  let query = `
    SELECT qs.*, 
           c.name as category_name, 
           c.color as category_color,
           COUNT(q.id) as question_count
    FROM question_sets qs
    LEFT JOIN categories c ON qs.category_id = c.id
    LEFT JOIN questions q ON qs.id = q.set_id
  `;
  
  const params: string[] = [];
  
  if (categoryId) {
    query += ' WHERE qs.category_id = ?';
    params.push(categoryId);
  }
  
  query += ' GROUP BY qs.id ORDER BY qs.created_at DESC';
  
  const result = await env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// Get single question set
app.get('/api/question-sets/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');
  
  const result = await env.DB.prepare(`
    SELECT qs.*, COUNT(q.id) as question_count
    FROM question_sets qs
    LEFT JOIN questions q ON qs.id = q.set_id
    WHERE qs.id = ?
    GROUP BY qs.id
  `).bind(id).first();
  
  if (!result) {
    return c.json({ success: false, error: 'Question set not found' }, 404);
  }
  
  return c.json({ success: true, data: result });
});

// Create question set
app.post('/api/question-sets', async (c) => {
  const { env } = c;
  const body = await c.req.json();
  const { name, description, category_id } = body;
  
  if (!name) {
    return c.json({ success: false, error: 'Name is required' }, 400);
  }
  
  const result = await env.DB.prepare(
    'INSERT INTO question_sets (name, description, category_id) VALUES (?, ?, ?)'
  ).bind(name, description || '', category_id || null).run();
  
  return c.json({ success: true, data: { id: result.meta.last_row_id } });
});

// Update question set
app.put('/api/question-sets/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');
  const body = await c.req.json();
  const { name, description, category_id } = body;
  
  if (!name) {
    return c.json({ success: false, error: 'Name is required' }, 400);
  }
  
  const result = await env.DB.prepare(
    'UPDATE question_sets SET name = ?, description = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(name, description || '', category_id || null, id).run();
  
  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Question set not found' }, 404);
  }
  
  return c.json({ success: true });
});

// Delete question set
app.delete('/api/question-sets/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');
  
  // Check if it's the default set
  if (id === '1') {
    return c.json({ success: false, error: 'Cannot delete default question set' }, 400);
  }
  
  const result = await env.DB.prepare('DELETE FROM question_sets WHERE id = ?').bind(id).run();
  
  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Question set not found' }, 404);
  }
  
  return c.json({ success: true });
});

// ==================== Questions API ====================

// Get all questions with optional filters
app.get('/api/questions', async (c) => {
  const { env } = c;
  const difficulty = c.req.query('difficulty');
  const setId = c.req.query('set_id');
  const limit = c.req.query('limit') || '100';
  
  let query = 'SELECT * FROM questions';
  const params: string[] = [];
  const conditions: string[] = [];
  
  if (difficulty && ['A', 'B', 'C'].includes(difficulty)) {
    conditions.push('difficulty = ?');
    params.push(difficulty);
  }
  
  if (setId) {
    conditions.push('set_id = ?');
    params.push(setId);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
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
  const setId = c.req.query('set_id');
  
  let query = 'SELECT * FROM questions';
  const params: string[] = [];
  const conditions: string[] = [];
  
  if (difficulty && ['A', 'B', 'C'].includes(difficulty)) {
    conditions.push('difficulty = ?');
    params.push(difficulty);
  }
  
  if (setId) {
    conditions.push('set_id = ?');
    params.push(setId);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY RANDOM() LIMIT ?';
  params.push(count.toString());
  
  const result = await env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: result.results });
});

// Get questions for review (based on incorrect answers + review marks)
app.get('/api/questions/review', async (c) => {
  const { env } = c;
  const limit = c.req.query('limit') || '20';
  const setId = c.req.query('set_id');
  
  // Get questions with incorrect answers
  let incorrectQuery = `
    SELECT DISTINCT q.*, 
           COUNT(lh.id) as attempt_count,
           SUM(CASE WHEN lh.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
           MAX(lh.attempted_at) as last_attempted,
           0 as is_marked
    FROM questions q
    LEFT JOIN learning_history lh ON q.id = lh.question_id
    WHERE lh.id IS NOT NULL
  `;
  
  const incorrectParams: string[] = [];
  
  if (setId) {
    incorrectQuery += ' AND q.set_id = ?';
    incorrectParams.push(setId);
  }
  
  incorrectQuery += `
    GROUP BY q.id
    HAVING correct_count < attempt_count
  `;
  
  // Get marked questions
  let markedQuery = `
    SELECT DISTINCT q.*,
           0 as attempt_count,
           0 as correct_count,
           rm.marked_at as last_attempted,
           1 as is_marked
    FROM questions q
    INNER JOIN review_marks rm ON q.id = rm.question_id
  `;
  
  const markedParams: string[] = [];
  
  if (setId) {
    markedQuery += ' WHERE q.set_id = ?';
    markedParams.push(setId);
  }
  
  // Combine both queries with UNION
  const combinedQuery = `
    WITH review_questions AS (
      ${incorrectQuery}
      UNION
      ${markedQuery}
    )
    SELECT * FROM review_questions
    ORDER BY is_marked DESC, last_attempted DESC, attempt_count DESC
    LIMIT ?
  `;
  
  const allParams = [...incorrectParams, ...markedParams, limit];
  
  const result = await env.DB.prepare(combinedQuery).bind(...allParams).all();
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

// Import questions from JSON (bulk insert) with question set support
app.post('/api/questions/import', async (c) => {
  const { env } = c;
  const body = await c.req.json();
  const { questions, set_name, set_description, replace_set } = body;
  
  if (!Array.isArray(questions) || questions.length === 0) {
    return c.json({ success: false, error: 'Invalid questions data' }, 400);
  }
  
  if (!set_name) {
    return c.json({ success: false, error: 'Question set name is required' }, 400);
  }
  
  try {
    // Create new question set
    const setResult = await env.DB.prepare(
      'INSERT INTO question_sets (name, description) VALUES (?, ?)'
    ).bind(set_name, set_description || '').run();
    
    const setId = setResult.meta.last_row_id;
    
    // If replace_set is true, delete existing questions in this set
    if (replace_set && setId) {
      await env.DB.prepare('DELETE FROM questions WHERE set_id = ?').bind(setId).run();
    }
    
    // Insert all questions with set_id
    let successCount = 0;
    for (const q of questions) {
      if (!q.no || !q.question_text || !q.difficulty || !q.answer) {
        continue; // Skip invalid questions
      }
      
      // Normalize answer (convert 〇 to ○)
      const normalizedAnswer = q.answer.replace(/[〇]/g, '○');
      
      await env.DB.prepare(
        'INSERT INTO questions (no, question_text, difficulty, answer, explanation, set_id) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(q.no, q.question_text, q.difficulty, normalizedAnswer, q.explanation || '', setId).run();
      
      successCount++;
    }
    
    return c.json({ 
      success: true, 
      imported: successCount, 
      total: questions.length,
      set_id: setId,
      set_name: set_name
    });
  } catch (error) {
    return c.json({ success: false, error: 'Import failed: ' + String(error) }, 500);
  }
});

// Export questions to JSON (with optional set filter)
app.get('/api/questions/export', async (c) => {
  const { env } = c;
  const setId = c.req.query('set_id');
  
  let query = 'SELECT * FROM questions';
  const params: string[] = [];
  
  if (setId) {
    query += ' WHERE set_id = ?';
    params.push(setId);
  }
  
  query += ' ORDER BY no ASC';
  
  const result = await env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// ==================== Review Marks API ====================

// Add review mark to a question
app.post('/api/review-marks', async (c) => {
  const { env } = c;
  const body = await c.req.json();
  const { question_id } = body;
  
  if (!question_id) {
    return c.json({ success: false, error: 'Question ID is required' }, 400);
  }
  
  try {
    // Use INSERT OR IGNORE to avoid duplicate marks
    await env.DB.prepare(
      'INSERT OR IGNORE INTO review_marks (question_id) VALUES (?)'
    ).bind(question_id).run();
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to add review mark: ' + String(error) }, 500);
  }
});

// Remove review mark from a question
app.delete('/api/review-marks/:question_id', async (c) => {
  const { env } = c;
  const questionId = c.req.param('question_id');
  
  const result = await env.DB.prepare('DELETE FROM review_marks WHERE question_id = ?').bind(questionId).run();
  
  return c.json({ success: true, deleted: result.meta.changes > 0 });
});

// Check if question is marked for review
app.get('/api/review-marks/:question_id', async (c) => {
  const { env } = c;
  const questionId = c.req.param('question_id');
  
  const result = await env.DB.prepare('SELECT * FROM review_marks WHERE question_id = ?').bind(questionId).first();
  
  return c.json({ success: true, is_marked: !!result });
});

// Get all marked questions
app.get('/api/review-marks', async (c) => {
  const { env } = c;
  const setId = c.req.query('set_id');
  
  let query = `
    SELECT q.*, rm.marked_at
    FROM questions q
    INNER JOIN review_marks rm ON q.id = rm.question_id
  `;
  
  const params: string[] = [];
  
  if (setId) {
    query += ' WHERE q.set_id = ?';
    params.push(setId);
  }
  
  query += ' ORDER BY rm.marked_at DESC';
  
  const result = await env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// ==================== Learning History API ====================

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

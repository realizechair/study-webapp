// Global state
let currentView = 'home';
let questions = [];
let currentQuestionIndex = 0;
let quizQuestions = [];
let quizAnswers = [];
let stats = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadView('home');
    loadStats();
});

// Load view
function loadView(view) {
    currentView = view;
    const app = document.getElementById('app');
    
    switch(view) {
        case 'home':
            app.innerHTML = renderHome();
            break;
        case 'manage':
            app.innerHTML = renderManage();
            loadQuestions();
            break;
        case 'study':
            app.innerHTML = renderStudyMenu();
            break;
        case 'quiz':
            startQuiz();
            break;
        case 'review':
            startReview();
            break;
        case 'stats':
            app.innerHTML = renderStats();
            loadDetailedStats();
            break;
    }
}

// Render home view
function renderHome() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div class="container mx-auto px-4 py-12">
                <div class="max-w-4xl mx-auto">
                    <!-- Header -->
                    <div class="text-center mb-12">
                        <h1 class="text-5xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-graduation-cap text-indigo-600"></i>
                            学習アプリ
                        </h1>
                        <p class="text-xl text-gray-600">問題をインポートして効率的に学習しましょう</p>
                    </div>

                    <!-- Stats Summary -->
                    <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-chart-line text-green-500 mr-2"></i>
                            学習状況
                        </h2>
                        <div id="stats-summary" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="text-center p-4 bg-blue-50 rounded-lg">
                                <i class="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
                                <p class="text-sm text-gray-600 mt-2">読み込み中...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Main Menu -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onclick="loadView('study')" class="bg-white hover:bg-indigo-50 rounded-xl shadow-lg p-8 transition-all hover:scale-105">
                            <i class="fas fa-book-reader text-5xl text-indigo-600 mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">学習する</h3>
                            <p class="text-gray-600">ランダム出題や復習問題で学習</p>
                        </button>

                        <button onclick="loadView('manage')" class="bg-white hover:bg-green-50 rounded-xl shadow-lg p-8 transition-all hover:scale-105">
                            <i class="fas fa-cog text-5xl text-green-600 mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">問題管理</h3>
                            <p class="text-gray-600">Excelインポート/エクスポート</p>
                        </button>

                        <button onclick="loadView('stats')" class="bg-white hover:bg-purple-50 rounded-xl shadow-lg p-8 transition-all hover:scale-105">
                            <i class="fas fa-chart-bar text-5xl text-purple-600 mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">統計情報</h3>
                            <p class="text-gray-600">学習履歴と成績を確認</p>
                        </button>

                        <a href="https://github.com" target="_blank" class="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-8 transition-all hover:scale-105">
                            <i class="fab fa-github text-5xl text-gray-700 mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">使い方</h3>
                            <p class="text-gray-600">詳細な使い方を確認</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render manage view
function renderManage() {
    return `
        <div class="min-h-screen bg-gray-50">
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-6xl mx-auto">
                    <!-- Header -->
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-4xl font-bold text-gray-800">
                            <i class="fas fa-cog text-green-600 mr-2"></i>
                            問題管理
                        </h1>
                        <button onclick="loadView('home')" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                            <i class="fas fa-home mr-2"></i>ホームに戻る
                        </button>
                    </div>

                    <!-- Import/Export Section -->
                    <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-file-excel text-green-600 mr-2"></i>
                            Excel インポート/エクスポート
                        </h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Excelファイルをインポート</label>
                                <input type="file" id="excel-file" accept=".xlsx,.xls" class="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-50 file:text-indigo-700
                                    hover:file:bg-indigo-100 cursor-pointer">
                                <p class="text-xs text-gray-500 mt-1">形式: A列=No, B列=問題文, C列=難易度(A/B/C), D列=回答, E列=解説</p>
                            </div>
                            <div class="flex flex-col justify-end">
                                <label class="flex items-center mb-2">
                                    <input type="checkbox" id="replace-data" class="mr-2">
                                    <span class="text-sm text-gray-700">既存データを削除してインポート</span>
                                </label>
                                <button onclick="importExcel()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition">
                                    <i class="fas fa-upload mr-2"></i>インポート
                                </button>
                            </div>
                        </div>

                        <div class="border-t pt-4">
                            <button onclick="exportExcel()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                                <i class="fas fa-download mr-2"></i>Excel形式でエクスポート
                            </button>
                        </div>
                    </div>

                    <!-- Questions List -->
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-list text-blue-600 mr-2"></i>
                            登録済み問題
                        </h2>
                        <div id="questions-list" class="space-y-2">
                            <div class="text-center py-8">
                                <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                                <p class="text-gray-600 mt-2">読み込み中...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render study menu
function renderStudyMenu() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <div class="container mx-auto px-4 py-12">
                <div class="max-w-4xl mx-auto">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-4xl font-bold text-gray-800">
                            <i class="fas fa-book-reader text-purple-600 mr-2"></i>
                            学習モード選択
                        </h1>
                        <button onclick="loadView('home')" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                            <i class="fas fa-home mr-2"></i>ホームに戻る
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Random Quiz -->
                        <div class="bg-white rounded-xl shadow-lg p-8">
                            <i class="fas fa-random text-5xl text-blue-600 mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-800 mb-4">ランダム出題</h3>
                            <p class="text-gray-600 mb-4">問題をランダムに出題します</p>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">問題数</label>
                                <input type="number" id="quiz-count" value="10" min="1" max="100" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">難易度フィルター</label>
                                <select id="quiz-difficulty" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">すべて</option>
                                    <option value="A">A (易しい)</option>
                                    <option value="B">B (普通)</option>
                                    <option value="C">C (難しい)</option>
                                </select>
                            </div>
                            
                            <button onclick="loadView('quiz')" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
                                <i class="fas fa-play mr-2"></i>開始
                            </button>
                        </div>

                        <!-- Review Mode -->
                        <div class="bg-white rounded-xl shadow-lg p-8">
                            <i class="fas fa-redo text-5xl text-orange-600 mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-800 mb-4">復習モード</h3>
                            <p class="text-gray-600 mb-4">間違えた問題を復習します</p>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">問題数</label>
                                <input type="number" id="review-count" value="20" min="1" max="100" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            </div>
                            
                            <div class="mb-12">
                                <p class="text-sm text-gray-500">※正答率の低い問題を優先的に出題</p>
                            </div>
                            
                            <button onclick="loadView('review')" class="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition">
                                <i class="fas fa-play mr-2"></i>開始
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render stats view
function renderStats() {
    return `
        <div class="min-h-screen bg-gray-50">
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-6xl mx-auto">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-4xl font-bold text-gray-800">
                            <i class="fas fa-chart-bar text-purple-600 mr-2"></i>
                            統計情報
                        </h1>
                        <button onclick="loadView('home')" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                            <i class="fas fa-home mr-2"></i>ホームに戻る
                        </button>
                    </div>

                    <!-- Overall Stats -->
                    <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">全体の統計</h2>
                        <div id="overall-stats" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="text-center">
                                <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Difficulty Stats -->
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">難易度別統計</h2>
                        <div id="difficulty-stats" class="space-y-4">
                            <div class="text-center py-4">
                                <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load questions
async function loadQuestions() {
    try {
        const response = await axios.get('/api/questions');
        if (response.data.success) {
            questions = response.data.data;
            renderQuestionsList();
        }
    } catch (error) {
        alert('問題の読み込みに失敗しました: ' + error.message);
    }
}

// Render questions list
function renderQuestionsList() {
    const listEl = document.getElementById('questions-list');
    
    if (questions.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-600">問題が登録されていません</p>
                <p class="text-sm text-gray-500">Excelファイルをインポートしてください</p>
            </div>
        `;
        return;
    }
    
    listEl.innerHTML = `
        <div class="mb-4 text-right text-gray-600">
            <i class="fas fa-list mr-2"></i>
            全 ${questions.length} 問
        </div>
        ${questions.map(q => `
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">No.${q.no}</span>
                            <span class="bg-${getDifficultyColor(q.difficulty)}-100 text-${getDifficultyColor(q.difficulty)}-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                難易度: ${q.difficulty}
                            </span>
                        </div>
                        <p class="text-gray-800 font-medium mb-2">${escapeHtml(q.question_text)}</p>
                        <p class="text-sm text-gray-600">
                            <strong>回答:</strong> ${escapeHtml(q.answer)}
                        </p>
                        ${q.explanation ? `<p class="text-sm text-gray-500 mt-1"><strong>解説:</strong> ${escapeHtml(q.explanation)}</p>` : ''}
                    </div>
                    <button onclick="deleteQuestion(${q.id})" class="text-red-600 hover:text-red-800 ml-4">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

// Import Excel
async function importExcel() {
    const fileInput = document.getElementById('excel-file');
    const replaceData = document.getElementById('replace-data').checked;
    
    if (!fileInput.files || !fileInput.files[0]) {
        alert('ファイルを選択してください');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            // Parse Excel data (skip header row if exists)
            const startRow = jsonData[0] && jsonData[0][0] === 'No' ? 1 : 0;
            const parsedQuestions = [];
            
            for (let i = startRow; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || !row[0]) continue; // Skip empty rows
                
                parsedQuestions.push({
                    no: parseInt(row[0]) || i + 1,
                    question_text: String(row[1] || ''),
                    difficulty: String(row[2] || 'B').toUpperCase(),
                    answer: String(row[3] || ''),
                    explanation: String(row[4] || '')
                });
            }
            
            if (parsedQuestions.length === 0) {
                alert('有効なデータが見つかりませんでした');
                return;
            }
            
            // Send to API
            const response = await axios.post('/api/questions/import', {
                questions: parsedQuestions,
                replace: replaceData
            });
            
            if (response.data.success) {
                alert(`${response.data.imported}問を正常にインポートしました`);
                loadQuestions();
                fileInput.value = '';
            } else {
                alert('インポートに失敗しました: ' + response.data.error);
            }
        } catch (error) {
            alert('ファイルの読み込みに失敗しました: ' + error.message);
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Export Excel
async function exportExcel() {
    try {
        const response = await axios.get('/api/questions/export');
        if (!response.data.success) {
            alert('エクスポートに失敗しました');
            return;
        }
        
        const questions = response.data.data;
        
        if (questions.length === 0) {
            alert('エクスポートする問題がありません');
            return;
        }
        
        // Prepare data for Excel
        const excelData = [
            ['No', '問題文', '難易度', '回答', '解説']
        ];
        
        questions.forEach(q => {
            excelData.push([
                q.no,
                q.question_text,
                q.difficulty,
                q.answer,
                q.explanation || ''
            ]);
        });
        
        // Create workbook
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '問題一覧');
        
        // Download
        const filename = `questions_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
        
        alert(`${questions.length}問をエクスポートしました`);
    } catch (error) {
        alert('エクスポートに失敗しました: ' + error.message);
    }
}

// Delete question
async function deleteQuestion(id) {
    if (!confirm('この問題を削除しますか?')) return;
    
    try {
        const response = await axios.delete(`/api/questions/${id}`);
        if (response.data.success) {
            alert('問題を削除しました');
            loadQuestions();
        } else {
            alert('削除に失敗しました');
        }
    } catch (error) {
        alert('削除に失敗しました: ' + error.message);
    }
}

// Start quiz
async function startQuiz() {
    const count = parseInt(document.getElementById('quiz-count')?.value || 10);
    const difficulty = document.getElementById('quiz-difficulty')?.value || '';
    
    try {
        let url = `/api/questions/random/${count}`;
        if (difficulty) {
            url += `?difficulty=${difficulty}`;
        }
        
        const response = await axios.get(url);
        if (response.data.success && response.data.data.length > 0) {
            quizQuestions = response.data.data;
            currentQuestionIndex = 0;
            quizAnswers = [];
            renderQuizQuestion();
        } else {
            alert('問題が見つかりませんでした');
            loadView('study');
        }
    } catch (error) {
        alert('問題の読み込みに失敗しました: ' + error.message);
        loadView('study');
    }
}

// Start review
async function startReview() {
    const count = parseInt(document.getElementById('review-count')?.value || 20);
    
    try {
        const response = await axios.get(`/api/questions/review?limit=${count}`);
        if (response.data.success && response.data.data.length > 0) {
            quizQuestions = response.data.data;
            currentQuestionIndex = 0;
            quizAnswers = [];
            renderQuizQuestion();
        } else {
            alert('復習する問題がありません。まず学習を進めてください。');
            loadView('study');
        }
    } catch (error) {
        alert('問題の読み込みに失敗しました: ' + error.message);
        loadView('study');
    }
}

// Render quiz question
function renderQuizQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-3xl mx-auto">
                    <!-- Progress -->
                    <div class="mb-6">
                        <div class="flex justify-between text-sm text-gray-600 mb-2">
                            <span>問題 ${currentQuestionIndex + 1} / ${quizQuestions.length}</span>
                            <span>${Math.round(progress)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3">
                            <div class="bg-indigo-600 h-3 rounded-full transition-all" style="width: ${progress}%"></div>
                        </div>
                    </div>

                    <!-- Question Card -->
                    <div class="bg-white rounded-xl shadow-2xl p-8">
                        <div class="mb-6">
                            <div class="flex items-center gap-2 mb-4">
                                <span class="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">No.${question.no}</span>
                                <span class="bg-${getDifficultyColor(question.difficulty)}-100 text-${getDifficultyColor(question.difficulty)}-800 text-sm font-semibold px-3 py-1 rounded">
                                    難易度: ${question.difficulty}
                                </span>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800">${escapeHtml(question.question_text)}</h2>
                        </div>

                        <!-- Answer Buttons -->
                        <div class="mb-6">
                            <label class="block text-lg font-medium text-gray-700 mb-4 text-center">あなたの回答を選択してください</label>
                            <div class="grid grid-cols-2 gap-6">
                                <button onclick="submitAnswer('○')" class="group bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white p-8 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95">
                                    <div class="text-7xl font-bold mb-2">○</div>
                                    <div class="text-xl font-semibold">正しい</div>
                                </button>
                                <button onclick="submitAnswer('×')" class="group bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white p-8 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95">
                                    <div class="text-7xl font-bold mb-2">×</div>
                                    <div class="text-xl font-semibold">誤り</div>
                                </button>
                            </div>
                        </div>

                        <!-- Cancel Button -->
                        <div class="text-center">
                            <button onclick="if(confirm('学習を中止しますか?')) loadView('study')" class="bg-gray-500 hover:bg-gray-600 text-white px-8 py-2 rounded-lg transition">
                                <i class="fas fa-times mr-2"></i>中止
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Submit answer
async function submitAnswer(userAnswer) {
    const question = quizQuestions[currentQuestionIndex];
    
    if (!userAnswer) {
        alert('回答を選択してください');
        return;
    }
    
    const isCorrect = userAnswer === question.answer;
    
    // Record answer
    quizAnswers.push({
        question: question,
        userAnswer: userAnswer,
        isCorrect: isCorrect
    });
    
    // Save to learning history
    try {
        await axios.post('/api/learning/record', {
            question_id: question.id,
            is_correct: isCorrect
        });
    } catch (error) {
        console.error('Failed to save learning history:', error);
    }
    
    // Show result
    showAnswerResult(isCorrect, question);
}

// Show answer result
function showAnswerResult(isCorrect, question) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
            <div class="max-w-2xl w-full mx-4">
                <div class="bg-white rounded-xl shadow-2xl p-8">
                    <!-- Result Icon -->
                    <div class="text-center mb-6">
                        ${isCorrect 
                            ? '<i class="fas fa-check-circle text-8xl text-green-500 mb-4"></i><h2 class="text-3xl font-bold text-green-600">正解！</h2>'
                            : '<i class="fas fa-times-circle text-8xl text-red-500 mb-4"></i><h2 class="text-3xl font-bold text-red-600">不正解</h2>'
                        }
                    </div>

                    <!-- Answer Details -->
                    <div class="space-y-4 mb-8">
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-gray-600 mb-1">問題</p>
                            <p class="text-lg font-medium text-gray-800">${escapeHtml(question.question_text)}</p>
                        </div>
                        
                        ${!isCorrect ? `
                            <div class="p-4 bg-red-50 rounded-lg">
                                <p class="text-sm text-red-600 mb-1">あなたの回答</p>
                                <p class="text-lg font-medium text-red-800">${escapeHtml(quizAnswers[quizAnswers.length - 1].userAnswer)}</p>
                            </div>
                        ` : ''}
                        
                        <div class="p-4 bg-green-50 rounded-lg">
                            <p class="text-sm text-green-600 mb-1">正解</p>
                            <p class="text-lg font-medium text-green-800">${escapeHtml(question.answer)}</p>
                        </div>
                        
                        ${question.explanation ? `
                            <div class="p-4 bg-blue-50 rounded-lg">
                                <p class="text-sm text-blue-600 mb-1">解説</p>
                                <p class="text-gray-800">${escapeHtml(question.explanation)}</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Next Button -->
                    <button onclick="nextQuestion()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition">
                        ${currentQuestionIndex < quizQuestions.length - 1 
                            ? '<i class="fas fa-arrow-right mr-2"></i>次の問題へ' 
                            : '<i class="fas fa-flag-checkered mr-2"></i>結果を見る'
                        }
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Next question
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizQuestions.length) {
        renderQuizQuestion();
    } else {
        showQuizResults();
    }
}

// Show quiz results
function showQuizResults() {
    const correctCount = quizAnswers.filter(a => a.isCorrect).length;
    const totalCount = quizAnswers.length;
    const accuracy = Math.round((correctCount / totalCount) * 100);
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-4xl mx-auto">
                    <!-- Results Header -->
                    <div class="bg-white rounded-xl shadow-2xl p-8 mb-8">
                        <div class="text-center mb-8">
                            <i class="fas fa-trophy text-8xl text-yellow-500 mb-4"></i>
                            <h1 class="text-4xl font-bold text-gray-800 mb-4">お疲れさまでした！</h1>
                            <div class="text-6xl font-bold mb-2 ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                                ${accuracy}%
                            </div>
                            <p class="text-xl text-gray-600">${correctCount} / ${totalCount} 問正解</p>
                        </div>

                        <div class="grid grid-cols-3 gap-4 mb-6">
                            <div class="text-center p-4 bg-green-50 rounded-lg">
                                <i class="fas fa-check text-2xl text-green-600 mb-2"></i>
                                <div class="text-2xl font-bold text-green-600">${correctCount}</div>
                                <div class="text-sm text-gray-600">正解</div>
                            </div>
                            <div class="text-center p-4 bg-red-50 rounded-lg">
                                <i class="fas fa-times text-2xl text-red-600 mb-2"></i>
                                <div class="text-2xl font-bold text-red-600">${totalCount - correctCount}</div>
                                <div class="text-sm text-gray-600">不正解</div>
                            </div>
                            <div class="text-center p-4 bg-blue-50 rounded-lg">
                                <i class="fas fa-list text-2xl text-blue-600 mb-2"></i>
                                <div class="text-2xl font-bold text-blue-600">${totalCount}</div>
                                <div class="text-sm text-gray-600">合計</div>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <button onclick="loadView('study')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition">
                                <i class="fas fa-redo mr-2"></i>もう一度学習
                            </button>
                            <button onclick="loadView('home')" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition">
                                <i class="fas fa-home mr-2"></i>ホームに戻る
                            </button>
                        </div>
                    </div>

                    <!-- Answer Details -->
                    <div class="bg-white rounded-xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-clipboard-list text-blue-600 mr-2"></i>
                            回答詳細
                        </h2>
                        <div class="space-y-3">
                            ${quizAnswers.map((answer, index) => `
                                <div class="border-l-4 ${answer.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} p-4 rounded">
                                    <div class="flex items-start justify-between">
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2 mb-2">
                                                <span class="text-sm font-semibold">${index + 1}.</span>
                                                <span class="text-sm text-gray-600">No.${answer.question.no}</span>
                                                ${answer.isCorrect 
                                                    ? '<i class="fas fa-check text-green-600"></i>' 
                                                    : '<i class="fas fa-times text-red-600"></i>'
                                                }
                                            </div>
                                            <p class="text-gray-800 mb-2">${escapeHtml(answer.question.question_text)}</p>
                                            <div class="text-sm">
                                                <span class="text-gray-600">あなたの回答:</span>
                                                <span class="font-medium ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}">${escapeHtml(answer.userAnswer)}</span>
                                                ${!answer.isCorrect ? `<span class="text-gray-600 ml-2">正解:</span><span class="font-medium text-green-700">${escapeHtml(answer.question.answer)}</span>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load stats
async function loadStats() {
    try {
        const response = await axios.get('/api/learning/stats');
        if (response.data.success) {
            stats = response.data.data;
            renderStatsSummary();
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Render stats summary
function renderStatsSummary() {
    const summaryEl = document.getElementById('stats-summary');
    if (!summaryEl || !stats) return;
    
    const accuracy = stats.accuracy_rate || 0;
    
    summaryEl.innerHTML = `
        <div class="text-center p-4 bg-blue-50 rounded-lg">
            <i class="fas fa-question-circle text-3xl text-blue-600 mb-2"></i>
            <div class="text-2xl font-bold text-blue-600">${stats.total_questions_attempted || 0}</div>
            <div class="text-sm text-gray-600">学習済み問題数</div>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
            <i class="fas fa-check-circle text-3xl text-green-600 mb-2"></i>
            <div class="text-2xl font-bold text-green-600">${stats.correct_attempts || 0}</div>
            <div class="text-sm text-gray-600">正解数</div>
        </div>
        <div class="text-center p-4 bg-purple-50 rounded-lg">
            <i class="fas fa-percentage text-3xl text-purple-600 mb-2"></i>
            <div class="text-2xl font-bold text-purple-600">${accuracy}%</div>
            <div class="text-sm text-gray-600">正答率</div>
        </div>
    `;
}

// Load detailed stats
async function loadDetailedStats() {
    try {
        // Load overall stats
        const statsResponse = await axios.get('/api/learning/stats');
        if (statsResponse.data.success) {
            const stats = statsResponse.data.data;
            const accuracy = stats.accuracy_rate || 0;
            
            document.getElementById('overall-stats').innerHTML = `
                <div class="text-center p-6 bg-blue-50 rounded-lg">
                    <i class="fas fa-list text-4xl text-blue-600 mb-3"></i>
                    <div class="text-3xl font-bold text-blue-600">${stats.total_attempts || 0}</div>
                    <div class="text-sm text-gray-600 mt-1">総挑戦回数</div>
                </div>
                <div class="text-center p-6 bg-green-50 rounded-lg">
                    <i class="fas fa-check text-4xl text-green-600 mb-3"></i>
                    <div class="text-3xl font-bold text-green-600">${stats.correct_attempts || 0}</div>
                    <div class="text-sm text-gray-600 mt-1">正解数</div>
                </div>
                <div class="text-center p-6 bg-red-50 rounded-lg">
                    <i class="fas fa-times text-4xl text-red-600 mb-3"></i>
                    <div class="text-3xl font-bold text-red-600">${(stats.total_attempts || 0) - (stats.correct_attempts || 0)}</div>
                    <div class="text-sm text-gray-600 mt-1">不正解数</div>
                </div>
                <div class="text-center p-6 bg-purple-50 rounded-lg">
                    <i class="fas fa-chart-line text-4xl text-purple-600 mb-3"></i>
                    <div class="text-3xl font-bold text-purple-600">${accuracy}%</div>
                    <div class="text-sm text-gray-600 mt-1">正答率</div>
                </div>
            `;
        }
        
        // Load difficulty stats
        const diffResponse = await axios.get('/api/learning/difficulty-stats');
        if (diffResponse.data.success) {
            const diffStats = diffResponse.data.data;
            
            document.getElementById('difficulty-stats').innerHTML = diffStats.map(stat => {
                const accuracy = stat.accuracy_rate || 0;
                const color = getDifficultyColor(stat.difficulty);
                
                return `
                    <div class="border border-gray-200 rounded-lg p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-gray-800">
                                <span class="bg-${color}-100 text-${color}-800 px-3 py-1 rounded">難易度 ${stat.difficulty}</span>
                            </h3>
                            <div class="text-2xl font-bold text-${color}-600">${accuracy}%</div>
                        </div>
                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div class="text-2xl font-bold text-gray-800">${stat.question_count || 0}</div>
                                <div class="text-xs text-gray-600">問題数</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-green-600">${stat.correct_attempts || 0}</div>
                                <div class="text-xs text-gray-600">正解</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-blue-600">${stat.total_attempts || 0}</div>
                                <div class="text-xs text-gray-600">挑戦回数</div>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="w-full bg-gray-200 rounded-full h-3">
                                <div class="bg-${color}-600 h-3 rounded-full transition-all" style="width: ${accuracy}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Failed to load detailed stats:', error);
    }
}

// Utility functions
function getDifficultyColor(difficulty) {
    switch(difficulty) {
        case 'A': return 'green';
        case 'B': return 'yellow';
        case 'C': return 'red';
        default: return 'gray';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Global state
let currentView = 'home';
let questions = [];
let questionSets = [];
let categories = [];
let selectedSetId = null;
let selectedCategoryId = null;
let currentQuestionIndex = 0;
let quizQuestions = [];
let quizAnswers = [];
let stats = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadView('home');
    loadStats();
    loadQuestionSets();
    loadCategories();
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
            loadQuestionSets().then(() => {
                renderQuestionSetsList();
                populateSetFilter();
            });
            break;
        case 'study':
            app.innerHTML = renderStudyMenu();
            loadCategories().then(() => {
                populateQuizCategoryOptions();
                populateReviewCategoryOptions();
            });
            loadQuestionSets().then(() => {
                populateQuizSetOptions();
            });
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

                    <!-- Tabs -->
                    <div class="bg-white rounded-t-xl shadow-lg mb-0">
                        <div class="flex border-b">
                            <button onclick="switchManageTab('import')" id="tab-import" class="flex-1 px-6 py-4 text-center font-medium text-gray-700 border-b-2 border-indigo-600 bg-indigo-50">
                                <i class="fas fa-file-excel mr-2"></i>インポート/エクスポート
                            </button>
                            <button onclick="switchManageTab('categories')" id="tab-categories" class="flex-1 px-6 py-4 text-center font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                                <i class="fas fa-tags mr-2"></i>カテゴリー管理
                            </button>
                            <button onclick="switchManageTab('sets')" id="tab-sets" class="flex-1 px-6 py-4 text-center font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                                <i class="fas fa-folder mr-2"></i>問題セット管理
                            </button>
                            <button onclick="switchManageTab('questions')" id="tab-questions" class="flex-1 px-6 py-4 text-center font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                                <i class="fas fa-list mr-2"></i>問題一覧
                            </button>
                        </div>
                    </div>

                    <!-- Tab Content -->
                    <div class="bg-white rounded-b-xl shadow-lg p-6">
                        <!-- Import/Export Tab -->
                        <div id="content-import" class="tab-content">
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

                        <!-- Categories Tab -->
                        <div id="content-categories" class="tab-content hidden">
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-2xl font-bold text-gray-800">
                                    <i class="fas fa-tags text-purple-600 mr-2"></i>
                                    カテゴリー一覧
                                </h2>
                                <button onclick="showCreateCategoryModal()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                                    <i class="fas fa-plus mr-2"></i>新規カテゴリー
                                </button>
                            </div>
                            <div id="categories-list" class="space-y-2">
                                <div class="text-center py-4">
                                    <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Question Sets Tab -->
                        <div id="content-sets" class="tab-content hidden">
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-2xl font-bold text-gray-800">
                                    <i class="fas fa-folder text-blue-600 mr-2"></i>
                                    問題セット一覧
                                </h2>
                                <div class="flex gap-2">
                                    <select id="category-filter" onchange="filterSetsByCategory(this.value)" class="px-4 py-2 border border-gray-300 rounded-lg">
                                        <option value="">すべてのカテゴリー</option>
                                    </select>
                                </div>
                            </div>
                            <div id="question-sets-list" class="space-y-2">
                                <div class="text-center py-4">
                                    <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Questions Tab -->
                        <div id="content-questions" class="tab-content hidden">
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-2xl font-bold text-gray-800">
                                    <i class="fas fa-list text-blue-600 mr-2"></i>
                                    登録済み問題
                                </h2>
                                <select id="set-filter" onchange="filterQuestionsBySet(this.value)" class="px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">すべての問題セット</option>
                                </select>
                            </div>
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
                                <label class="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
                                <select id="quiz-category" onchange="updateQuizSetsByCategory()" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">すべてのカテゴリー</option>
                                </select>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">問題セット</label>
                                <select id="quiz-set" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">すべて</option>
                                </select>
                            </div>
                            
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
                                <label class="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
                                <select id="review-category" onchange="updateReviewSetsByCategory()" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">すべてのカテゴリー</option>
                                </select>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">問題セット</label>
                                <select id="review-set" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">すべて</option>
                                </select>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">問題数</label>
                                <input type="number" id="review-count" value="20" min="1" max="100" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            </div>
                            
                            <div class="mb-4">
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
    const fileName = file.name.replace(/\.(xlsx?|xls)$/i, ''); // Remove extension
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
            
            // Send to API with file name as question set name
            const response = await axios.post('/api/questions/import', {
                questions: parsedQuestions,
                set_name: fileName,
                set_description: `${fileName}からインポート（${new Date().toLocaleString('ja-JP')}）`,
                replace_set: replaceData
            });
            
            if (response.data.success) {
                alert(`問題セット「${response.data.set_name}」に${response.data.imported}問をインポートしました`);
                loadQuestions();
                loadQuestionSets();
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
    const setId = document.getElementById('quiz-set')?.value || '';
    
    try {
        let url = `/api/questions/random/${count}`;
        const params = [];
        if (difficulty) {
            params.push(`difficulty=${difficulty}`);
        }
        if (setId) {
            params.push(`set_id=${setId}`);
        }
        if (params.length > 0) {
            url += '?' + params.join('&');
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
    const setId = document.getElementById('review-set')?.value || '';
    
    try {
        let url = `/api/questions/review?limit=${count}`;
        if (setId) {
            url += `&set_id=${setId}`;
        }
        const response = await axios.get(url);
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
                        <div class="space-y-4 mb-6">
                            <button onclick="submitAnswer('○')" class="w-full flex items-center gap-3 p-5 bg-white border-2 border-green-500 rounded-xl hover:bg-green-50 transition-all">
                                <div class="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center">
                                    <i class="fas fa-circle text-green-500 text-sm"></i>
                                </div>
                                <span class="text-lg font-medium text-gray-800">○ (はい・正しい)</span>
                            </button>
                            
                            <button onclick="submitAnswer('×')" class="w-full flex items-center gap-3 p-5 bg-white border-2 border-red-500 rounded-xl hover:bg-red-50 transition-all">
                                <div class="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center">
                                    <i class="fas fa-times text-red-500 text-lg"></i>
                                </div>
                                <span class="text-lg font-medium text-gray-800">× (いいえ・間違い)</span>
                            </button>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-3 mb-4">
                            <button onclick="markForReview(${question.id})" class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2">
                                <i class="fas fa-bookmark"></i>
                                <span>復習する</span>
                            </button>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="loadView('home')" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2">
                                <i class="fas fa-home"></i>
                                <span>ホームに戻る</span>
                            </button>
                            <button onclick="if(confirm('学習を中止しますか?')) loadView('study')" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition">
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
    
    // Normalize answer - handle both ○ (U+25CB) and 〇 (U+3007)
    const normalizeAnswer = (ans) => {
        if (!ans) return ans;
        // Convert both circle types to standard ○
        return ans.replace(/[○〇]/g, '○').replace(/[×]/g, '×');
    };
    
    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const normalizedCorrectAnswer = normalizeAnswer(question.answer);
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    
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

// Question Sets functions
async function loadQuestionSets() {
    try {
        const response = await axios.get('/api/question-sets');
        if (response.data.success) {
            questionSets = response.data.data;
        }
    } catch (error) {
        console.error('Failed to load question sets:', error);
    }
}

async function deleteQuestionSet(id) {
    if (!confirm('この問題セットを削除しますか？（問題も全て削除されます）')) return;
    
    try {
        const response = await axios.delete(`/api/question-sets/${id}`);
        if (response.data.success) {
            alert('問題セットを削除しました');
            loadQuestionSets();
            loadView('manage');
        } else {
            alert('削除に失敗しました: ' + response.data.error);
        }
    } catch (error) {
        alert('削除に失敗しました: ' + error.message);
    }
}

async function editQuestionSetName(id, currentName) {
    const newName = prompt('新しい問題セット名を入力してください', currentName);
    if (!newName || newName === currentName) return;
    
    try {
        const response = await axios.put(`/api/question-sets/${id}`, {
            name: newName,
            description: ''
        });
        
        if (response.data.success) {
            alert('問題セット名を変更しました');
            loadQuestionSets();
            loadView('manage');
        } else {
            alert('変更に失敗しました: ' + response.data.error);
        }
    } catch (error) {
        alert('変更に失敗しました: ' + error.message);
    }
}

function renderQuestionSetsList() {
    const listEl = document.getElementById('question-sets-list');
    if (!listEl) return;
    
    // Filter by category if selected
    let filteredSets = questionSets;
    if (selectedCategoryId) {
        filteredSets = questionSets.filter(set => set.category_id == selectedCategoryId);
    }
    
    if (filteredSets.length === 0) {
        listEl.innerHTML = '<p class="text-gray-500 text-center py-4">問題セットがありません</p>';
        return;
    }
    
    listEl.innerHTML = filteredSets.map(set => `
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
            <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        ${set.category_color ? `<div class="w-3 h-3 rounded-full" style="background-color: ${set.category_color}"></div>` : ''}
                        <span class="text-xs text-gray-500">${escapeHtml(set.category_name || '未分類')}</span>
                    </div>
                    <h4 class="font-semibold text-gray-800 text-lg">${escapeHtml(set.name)}</h4>
                    ${set.description ? `<p class="text-sm text-gray-500 mt-1">${escapeHtml(set.description)}</p>` : ''}
                </div>
                <div class="flex gap-2">
                    <button onclick="editQuestionSet(${set.id})" class="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition text-sm">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${set.id !== 1 ? `
                        <button onclick="deleteQuestionSet(${set.id})" class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-600">
                <span><i class="fas fa-question-circle mr-1"></i>${set.question_count || 0}問</span>
                <span><i class="fas fa-clock mr-1"></i>${new Date(set.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
        </div>
    `).join('');
}

function populateSetFilter() {
    const filterEl = document.getElementById('set-filter');
    if (!filterEl) return;
    
    filterEl.innerHTML = '<option value="">すべての問題セット</option>' +
        questionSets.map(set => `<option value="${set.id}">${escapeHtml(set.name)}</option>`).join('');
}

function populateQuizSetOptions() {
    const quizSetEl = document.getElementById('quiz-set');
    const reviewSetEl = document.getElementById('review-set');
    
    const options = '<option value="">すべて</option>' +
        questionSets.map(set => `<option value="${set.id}">${escapeHtml(set.name)}</option>`).join('');
    
    if (quizSetEl) quizSetEl.innerHTML = options;
    if (reviewSetEl) reviewSetEl.innerHTML = options;
}

function populateQuizCategoryOptions() {
    const categoryEl = document.getElementById('quiz-category');
    if (!categoryEl) return;
    
    categoryEl.innerHTML = '<option value="">すべてのカテゴリー</option>' +
        categories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
}

function populateReviewCategoryOptions() {
    const categoryEl = document.getElementById('review-category');
    if (!categoryEl) return;
    
    categoryEl.innerHTML = '<option value="">すべてのカテゴリー</option>' +
        categories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
}

function updateQuizSetsByCategory() {
    const categoryId = document.getElementById('quiz-category')?.value;
    const quizSetEl = document.getElementById('quiz-set');
    if (!quizSetEl) return;
    
    let filteredSets = questionSets;
    if (categoryId) {
        filteredSets = questionSets.filter(set => set.category_id == categoryId);
    }
    
    quizSetEl.innerHTML = '<option value="">すべて</option>' +
        filteredSets.map(set => `<option value="${set.id}">${escapeHtml(set.name)}</option>`).join('');
}

function updateReviewSetsByCategory() {
    const categoryId = document.getElementById('review-category')?.value;
    const reviewSetEl = document.getElementById('review-set');
    if (!reviewSetEl) return;
    
    let filteredSets = questionSets;
    if (categoryId) {
        filteredSets = questionSets.filter(set => set.category_id == categoryId);
    }
    
    reviewSetEl.innerHTML = '<option value="">すべて</option>' +
        filteredSets.map(set => `<option value="${set.id}">${escapeHtml(set.name)}</option>`).join('');
}

async function filterQuestionsBySet(setId) {
    try {
        const url = setId ? `/api/questions?set_id=${setId}` : '/api/questions';
        const response = await axios.get(url);
        if (response.data.success) {
            questions = response.data.data;
            renderQuestionsList();
        }
    } catch (error) {
        alert('問題の読み込みに失敗しました: ' + error.message);
    }
}

// Review mark functions
async function markForReview(questionId) {
    try {
        const response = await axios.post('/api/review-marks', {
            question_id: questionId
        });
        
        if (response.data.success) {
            // Show success message with icon
            const message = document.createElement('div');
            message.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50';
            message.innerHTML = '<i class="fas fa-bookmark"></i><span>復習リストに追加しました</span>';
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.remove();
            }, 2000);
        } else {
            alert('復習リストへの追加に失敗しました');
        }
    } catch (error) {
        console.error('Failed to mark for review:', error);
        alert('復習リストへの追加に失敗しました: ' + error.message);
    }
}

async function unmarkForReview(questionId) {
    try {
        const response = await axios.delete(`/api/review-marks/${questionId}`);
        
        if (response.data.success) {
            alert('復習リストから削除しました');
        } else {
            alert('削除に失敗しました');
        }
    } catch (error) {
        alert('削除に失敗しました: ' + error.message);
    }
}

// ==================== Category Management ====================

async function loadCategories() {
    try {
        const response = await axios.get('/api/categories');
        if (response.data.success) {
            categories = response.data.data;
            renderCategoriesList();
            populateCategoryFilter();
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function renderCategoriesList() {
    const container = document.getElementById('categories-list');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">カテゴリーがありません</p>';
        return;
    }
    
    container.innerHTML = categories.map(cat => `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div class="flex items-center gap-3 flex-1">
                <div class="w-4 h-4 rounded-full" style="background-color: ${cat.color}"></div>
                <div>
                    <h3 class="font-semibold text-gray-800">${escapeHtml(cat.name)}</h3>
                    <p class="text-sm text-gray-500">${escapeHtml(cat.description || '')}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${cat.set_count || 0}セット</span>
                ${cat.id !== 1 ? `
                    <button onclick="editCategory(${cat.id})" class="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition text-sm">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCategory(${cat.id})" class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function populateCategoryFilter() {
    const filter = document.getElementById('category-filter');
    if (!filter) return;
    
    filter.innerHTML = '<option value="">すべてのカテゴリー</option>' +
        categories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
}

function showCreateCategoryModal() {
    const name = prompt('カテゴリー名を入力してください:');
    if (!name) return;
    
    const description = prompt('説明を入力してください（省略可）:');
    const color = prompt('色を入力してください（例: #3B82F6）:', '#3B82F6');
    
    createCategory(name, description, color);
}

async function createCategory(name, description, color) {
    try {
        const response = await axios.post('/api/categories', {
            name: name,
            description: description || '',
            color: color || '#3B82F6'
        });
        
        if (response.data.success) {
            alert('カテゴリーを作成しました');
            loadCategories();
        }
    } catch (error) {
        alert('作成に失敗しました: ' + error.message);
    }
}

async function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const name = prompt('カテゴリー名を編集:', category.name);
    if (!name) return;
    
    const description = prompt('説明を編集:', category.description || '');
    const color = prompt('色を編集:', category.color || '#3B82F6');
    
    try {
        const response = await axios.put(`/api/categories/${categoryId}`, {
            name: name,
            description: description || '',
            color: color || '#3B82F6'
        });
        
        if (response.data.success) {
            alert('カテゴリーを更新しました');
            loadCategories();
        }
    } catch (error) {
        alert('更新に失敗しました: ' + error.message);
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('このカテゴリーを削除しますか？\n関連する問題セットは「未分類」に移動されます。')) {
        return;
    }
    
    try {
        const response = await axios.delete(`/api/categories/${categoryId}`);
        
        if (response.data.success) {
            alert('カテゴリーを削除しました');
            loadCategories();
            loadQuestionSets();
        }
    } catch (error) {
        alert('削除に失敗しました: ' + error.message);
    }
}

// ==================== Question Set Management ====================

async function deleteQuestionSet(setId) {
    if (!confirm('この問題セットを削除しますか？\n含まれるすべての問題も削除されます。')) {
        return;
    }
    
    try {
        const response = await axios.delete(`/api/question-sets/${setId}`);
        
        if (response.data.success) {
            alert('問題セットを削除しました');
            loadQuestionSets();
            loadQuestions();
        }
    } catch (error) {
        alert('削除に失敗しました: ' + error.message);
    }
}

async function editQuestionSet(setId) {
    const set = questionSets.find(s => s.id === setId);
    if (!set) return;
    
    const name = prompt('問題セット名を編集:', set.name);
    if (!name) return;
    
    const description = prompt('説明を編集:', set.description || '');
    
    // Category selection
    const categoryOptions = categories.map(cat => 
        `${cat.id}. ${cat.name}${cat.id === set.category_id ? ' (現在)' : ''}`
    ).join('\n');
    const categoryInput = prompt(`カテゴリーを選択してください（番号で入力）:\n${categoryOptions}`, set.category_id || '1');
    const categoryId = categoryInput ? parseInt(categoryInput) : set.category_id;
    
    try {
        const response = await axios.put(`/api/question-sets/${setId}`, {
            name: name,
            description: description || '',
            category_id: categoryId
        });
        
        if (response.data.success) {
            alert('問題セットを更新しました');
            loadQuestionSets();
        }
    } catch (error) {
        alert('更新に失敗しました: ' + error.message);
    }
}

async function filterSetsByCategory(categoryId) {
    selectedCategoryId = categoryId || null;
    renderQuestionSetsList();
}

// ==================== Tab Management ====================

function switchManageTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('[id^="tab-"]').forEach(tab => {
        tab.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-gray-700');
        tab.classList.add('border-transparent', 'text-gray-500');
    });
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
        activeTab.classList.remove('border-transparent', 'text-gray-500');
        activeTab.classList.add('border-indigo-600', 'bg-indigo-50', 'text-gray-700');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const activeContent = document.getElementById(`content-${tabName}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
    
    // Load data if needed
    if (tabName === 'categories') {
        loadCategories();
    } else if (tabName === 'sets') {
        loadQuestionSets().then(() => {
            renderQuestionSetsList();
            populateCategoryFilter();
        });
        loadCategories();
    } else if (tabName === 'questions') {
        loadQuestions();
        loadQuestionSets().then(() => {
            populateSetFilter();
        });
    }
}

# 学習アプリ - 問題管理システム

Excelデータをインポートして効率的に学習できるWebアプリケーションです。

## 🎯 プロジェクト概要

- **目的**: Excelファイルから問題をインポートし、ランダム出題や復習機能で効率的に学習
- **技術スタック**: Hono + TypeScript + Cloudflare D1 + TailwindCSS
- **特徴**: 
  - **ファイル別問題セット管理** - Excelファイル名を使用した自動分類
  - Excelファイルのインポート/エクスポート
  - 難易度別の問題管理（A/B/C）
  - 問題セット選択機能（ファイルごとに学習可能）
  - ランダム出題機能
  - 復習モード（間違えた問題を優先）
  - 学習履歴と統計情報の記録

## 🌐 アクセスURL

- **開発環境**: https://3000-ib7k94s63xezj4ljzm7gs-d0b9e1e2.sandbox.novita.ai
- **API Base**: `https://3000-ib7k94s63xezj4ljzm7gs-d0b9e1e2.sandbox.novita.ai/api`

## 📊 データ構造

### Excelインポート形式

| 列 | 内容 | 必須 | 備考 |
|---|---|---|---|
| A列 | No | ○ | 問題番号 |
| B列 | 問題文 | ○ | 〇×または選択式問題 |
| C列 | 難易度 | ○ | A/B/C の3段階 |
| D列 | 回答 | ○ | 正解の回答 |
| E列 | 解説 | × | 空欄可 |

### データベーステーブル

**question_sets (問題セット)**
- id: 主キー
- name: セット名（Excelファイル名）
- description: 説明
- created_at: 作成日時
- updated_at: 更新日時

**questions (問題)**
- id: 主キー
- no: 問題番号
- question_text: 問題文
- difficulty: 難易度 (A/B/C)
- answer: 回答
- explanation: 解説（任意）
- set_id: 問題セットID（外部キー）
- created_at: 作成日時
- updated_at: 更新日時

**learning_history (学習履歴)**
- id: 主キー
- question_id: 問題ID（外部キー）
- is_correct: 正解/不正解 (1/0)
- attempted_at: 回答日時

## 🚀 実装済み機能

### ✅ 完了機能

1. **問題セット管理機能** ⭐ NEW
   - Excelファイル名を使用した自動セット作成
   - 問題セット一覧表示
   - 問題セット名の編集
   - 問題セットの削除（問題も一緒に削除）
   - セット別フィルター機能

2. **問題管理機能**
   - Excelファイルからの一括インポート（セット自動作成）
   - Excel形式でのエクスポート（セット別可能）
   - 問題の一覧表示・削除
   - セット別問題表示

3. **学習機能**
   - ランダム出題（問題数・難易度・**問題セット**フィルター可）
   - 復習モード（正答率の低い問題を優先、**問題セット**選択可）
   - ⚪︎×二択ボタンでの回答
   - 回答の即時フィードバック
   - 解説表示

4. **統計・分析機能**
   - 全体の学習統計（正答率、挑戦回数）
   - 難易度別の統計情報
   - 問題ごとの正解率追跡

5. **UI/UX**
   - レスポンシブデザイン
   - TailwindCSSによる美しいUI
   - FontAwesomeアイコン使用
   - 進捗バー表示

### 🔮 今後の拡張案

1. **問題タイプの拡張**
   - 選択式問題のサポート（4択など）
   - 記述式問題の対応
   - 画像付き問題

2. **学習管理の強化**
   - 学習計画の設定
   - 目標正答率の設定
   - 達成バッジシステム

3. **データ分析**
   - 学習傾向グラフ
   - 週次/月次レポート
   - 苦手分野の特定

4. **ユーザー管理**
   - 複数ユーザー対応
   - ユーザー認証機能
   - 学習データの個別管理

## 📡 API エンドポイント

### 問題セット管理

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/question-sets` | 全問題セット取得 |
| GET | `/api/question-sets/:id` | 特定問題セット取得 |
| POST | `/api/question-sets` | 問題セットを新規作成 |
| PUT | `/api/question-sets/:id` | 問題セットを更新 |
| DELETE | `/api/question-sets/:id` | 問題セットを削除 |

### 問題管理

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/questions?set_id=X` | 全問題取得（難易度・セットフィルター可） |
| GET | `/api/questions/:id` | 特定問題取得 |
| GET | `/api/questions/random/:count?set_id=X` | ランダムに問題取得（セットフィルター可） |
| GET | `/api/questions/review?set_id=X` | 復習用問題取得（セットフィルター可） |
| POST | `/api/questions` | 問題を新規作成 |
| PUT | `/api/questions/:id` | 問題を更新 |
| DELETE | `/api/questions/:id` | 問題を削除 |
| POST | `/api/questions/import` | 問題を一括インポート（セット自動作成） |
| GET | `/api/questions/export?set_id=X` | 問題を一括エクスポート（セット別可） |

### 学習履歴

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/learning/record` | 学習履歴を記録 |
| GET | `/api/learning/stats` | 全体統計取得 |
| GET | `/api/learning/question-stats/:id` | 問題別統計取得 |
| GET | `/api/learning/difficulty-stats` | 難易度別統計取得 |

## 💻 使い方

### 1. 問題のインポート（ファイル名が問題セット名になります）

1. ホーム画面から「問題管理」を選択
2. Excelファイルを選択（形式は上記参照）
   - **ファイル名が問題セット名として自動登録されます**
   - 例：`簿記3級_第1回.xlsx` → 問題セット名「簿記3級_第1回」
3. 「インポート」ボタンをクリック
4. インポート完了後、問題セット一覧に自動追加されます

### 2. 問題セットの管理

**問題セット一覧の表示**
1. 「問題管理」画面で問題セット一覧を確認
2. 各セットの問題数が表示されます

**問題セット名の編集**
1. 問題セット横の編集ボタン（✏️）をクリック
2. 新しい名前を入力

**問題セットの削除**
1. 問題セット横の削除ボタン（🗑️）をクリック
2. 確認後、セット内の問題も一緒に削除されます

### 3. 学習の開始

**ランダム出題**
1. ホーム画面から「学習する」を選択
2. 「ランダム出題」を選択
3. **問題セット**、問題数、難易度を設定
   - 問題セットを選択すると、そのファイルの問題のみ出題
4. 「開始」ボタンをクリック

**復習モード**
1. ホーム画面から「学習する」を選択
2. 「復習モード」を選択
3. **問題セット**、問題数を設定
4. 「開始」ボタンをクリック

### 4. 学習の進行

1. 問題が表示されたら**⚪︎または×ボタン**をクリック
2. 正解・不正解と解説が即座に表示される
3. 「次の問題へ」で続行
4. すべて終了後に結果サマリーが表示

### 5. 統計の確認

1. ホーム画面から「統計情報」を選択
2. 全体の統計と難易度別統計を確認

### 6. データのエクスポート

1. 「問題管理」画面へ移動
2. 問題一覧上部のセレクトボックスでセットを選択（任意）
3. 「Excel形式でエクスポート」ボタンをクリック
4. ファイルがダウンロードされる

## 🛠️ 開発情報

### ローカル開発

```bash
# ビルド
npm run build

# D1データベースマイグレーション
npm run db:migrate:local

# サンプルデータ投入
npm run db:seed

# 開発サーバー起動（PM2）
pm2 start ecosystem.config.cjs

# サーバー確認
curl http://localhost:3000/api/questions
```

### データベースリセット

```bash
npm run db:reset
```

### PM2コマンド

```bash
# ステータス確認
pm2 list

# ログ確認（非ブロッキング）
pm2 logs --nostream

# 再起動
npm run clean-port && pm2 restart webapp

# 停止・削除
pm2 delete webapp
```

## 🎨 デザインシステム

- **カラースキーム**: Blue/Indigo (メイン), Green (成功), Red (エラー), Purple (統計)
- **フォント**: システムフォント
- **アイコン**: FontAwesome 6.4.0
- **CSSフレームワーク**: TailwindCSS (CDN)

## 📦 依存ライブラリ

### バックエンド
- **Hono**: 軽量Webフレームワーク
- **Cloudflare D1**: SQLiteベースのデータベース
- **Wrangler**: Cloudflare開発ツール

### フロントエンド（CDN）
- **TailwindCSS**: CSSフレームワーク
- **FontAwesome**: アイコンライブラリ
- **SheetJS (xlsx)**: Excel処理ライブラリ
- **Axios**: HTTPクライアント

## 🚀 デプロイ

### Cloudflare Pagesへのデプロイ

```bash
# ビルド
npm run build

# Cloudflare D1データベース作成
npx wrangler d1 create webapp-production

# wrangler.jsonc にdatabase_idを設定

# マイグレーション実行（本番）
npm run db:migrate:prod

# デプロイ
npm run deploy
```

## 📄 ライセンス

MIT License

## 🤝 サポート

問題や質問がある場合は、GitHubのIssueを作成してください。

---

**最終更新日**: 2025-10-18  
**バージョン**: 1.0.0  
**ステータス**: ✅ 開発完了・動作確認済み

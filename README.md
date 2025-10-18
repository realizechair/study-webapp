# 学習アプリ - 問題管理システム

Excelデータをインポートして効率的に学習できるWebアプリケーションです。

## 🎯 プロジェクト概要

- **目的**: Excelファイルから問題をインポートし、ランダム出題や復習機能で効率的に学習
- **技術スタック**: Hono + TypeScript + Cloudflare D1 + TailwindCSS
- **特徴**: 
  - Excelファイルのインポート/エクスポート
  - 難易度別の問題管理（A/B/C）
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

**questions (問題)**
- id: 主キー
- no: 問題番号
- question_text: 問題文
- difficulty: 難易度 (A/B/C)
- answer: 回答
- explanation: 解説（任意）
- created_at: 作成日時
- updated_at: 更新日時

**learning_history (学習履歴)**
- id: 主キー
- question_id: 問題ID（外部キー）
- is_correct: 正解/不正解 (1/0)
- attempted_at: 回答日時

## 🚀 実装済み機能

### ✅ 完了機能

1. **問題管理機能**
   - Excelファイルからの一括インポート
   - Excel形式でのエクスポート
   - 問題の一覧表示・削除
   - 既存データの置き換えオプション

2. **学習機能**
   - ランダム出題（問題数・難易度フィルター可）
   - 復習モード（正答率の低い問題を優先）
   - 回答の即時フィードバック
   - 解説表示

3. **統計・分析機能**
   - 全体の学習統計（正答率、挑戦回数）
   - 難易度別の統計情報
   - 問題ごとの正解率追跡

4. **UI/UX**
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

### 問題管理

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/questions` | 全問題取得（難易度フィルター可） |
| GET | `/api/questions/:id` | 特定問題取得 |
| GET | `/api/questions/random/:count` | ランダムに問題取得 |
| GET | `/api/questions/review` | 復習用問題取得 |
| POST | `/api/questions` | 問題を新規作成 |
| PUT | `/api/questions/:id` | 問題を更新 |
| DELETE | `/api/questions/:id` | 問題を削除 |
| POST | `/api/questions/import` | 問題を一括インポート |
| GET | `/api/questions/export` | 問題を一括エクスポート |

### 学習履歴

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/learning/record` | 学習履歴を記録 |
| GET | `/api/learning/stats` | 全体統計取得 |
| GET | `/api/learning/question-stats/:id` | 問題別統計取得 |
| GET | `/api/learning/difficulty-stats` | 難易度別統計取得 |

## 💻 使い方

### 1. 問題のインポート

1. ホーム画面から「問題管理」を選択
2. Excelファイルを選択（形式は上記参照）
3. 必要に応じて「既存データを削除してインポート」をチェック
4. 「インポート」ボタンをクリック

### 2. 学習の開始

**ランダム出題**
1. ホーム画面から「学習する」を選択
2. 「ランダム出題」を選択
3. 問題数と難易度を設定
4. 「開始」ボタンをクリック

**復習モード**
1. ホーム画面から「学習する」を選択
2. 「復習モード」を選択
3. 問題数を設定
4. 「開始」ボタンをクリック

### 3. 学習の進行

1. 問題が表示されたら回答を入力
2. 「回答する」ボタンで判定
3. 正解・不正解と解説が表示される
4. 「次の問題へ」で続行
5. すべて終了後に結果サマリーが表示

### 4. 統計の確認

1. ホーム画面から「統計情報」を選択
2. 全体の統計と難易度別統計を確認

### 5. データのエクスポート

1. 「問題管理」画面へ移動
2. 「Excel形式でエクスポート」ボタンをクリック
3. ファイルがダウンロードされる

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

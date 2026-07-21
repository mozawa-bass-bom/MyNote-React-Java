# Vercel デプロイ・環境変数・パスワード保護 ガイド

本ドキュメントでは、MyNote プロジェクト（React フロントエンド ＋ Spring Boot バックエンド）を Vercel へデプロイし、環境変数の設定およびパスワード保護（アクセス制限）を行う手順を解説します。

---

## 1. 概要

- **フロントエンド (`frontend`)**: React (Vite) / SPA。Vercel 標準の静的サイトホスティング機能で高速デプロイ。
- **バックエンド (`backend`)**: Spring Boot (Java 21)。Vercel の `Dockerfile.vercel` サポート機能（Vercel Container Registry / Fluid Compute）を利用してコンテナとして直接デプロイ。
- **セキュリティ**: Vercel の Deployment Protection 機能を使用して、サイト全体にパスワード保護を適用。

---

## 2. デプロイ手順

### Step 1: バックエンドのデプロイ (Docker / Spring Boot)

1. **Vercel ダッシュボード**（https://vercel.com/）にて `Add New` -> `Project` を選択。
2. GitHub リポジトリ `MyNote-React-Java` を選択。
3. プロジェクト設定：
   - **Root Directory**: `backend`
   - **Framework Preset**: `Other`（または `Dockerfile` 自動検出）
   - **Build Step**: 自動で `Dockerfile.vercel` が認識されます。
4. **Environment Variables（環境変数）** を登録（詳細は「3. 環境変数の設定」参照）。
5. `Deploy` を実行し、発行されたバックエンド URL（例: `https://mynote-backend.vercel.app`）をメモします。

### Step 2: フロントエンドのデプロイ (React)

1. Vercel ダッシュボードにて再度 `Add New` -> `Project` を選択。
2. 同じリポジトリを選択し、プロジェクト設定：
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
3. **Environment Variables（環境変数）** を設定：
   - `VITE_API_BASE_URL`: Step 1 で発行されたバックエンドの URL + `/api` （例: `https://mynote-backend.vercel.app/api`）
4. `Deploy` を実行します。

---

## 3. 環境変数 (Environment Variables) の設定

Vercel の各プロジェクト画面 (`Project Settings` -> `Environment Variables`) にて、以下の環境変数を登録します。

### フロントエンド (`frontend`)

| キー | 値の例 / 説明 |
|---|---|
| `VITE_API_BASE_URL` | `https://mynote-backend.vercel.app/api` （バックエンドのベースURL） |

### バックエンド (`backend`)

| キー | 値の例 / 説明 |
|---|---|
| `DB_URL` | `jdbc:mysql://<DB_HOST>:3306/<DB_NAME>?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Tokyo` |
| `DB_USER` | DB ユーザー名 |
| `DB_PASS` | DB パスワード |
| `JWT_SECRET` | 32文字以上のランダムな秘密鍵 |
| `CORS_ORIGINS` | `https://mynote-frontend.vercel.app` （フロントエンドのURL） |
| `VERTEX_PROJECT_ID` | GCP プロジェクト ID |
| `VERTEX_LOCATION` | `us-central1` |
| `FIREBASE_BUCKET` | Firebase Storage バケット名 |

---

## 4. パスワード保護（セキュリティ制限）の設定

サイト全体にパスワード保護をかけて、パスワードを知っている関係者のみ閲覧できるように設定します。

### 設定手順 (Vercel Deployment Protection)

1. Vercel ダッシュボードでフロントエンド（および必要に応じてバックエンド）のプロジェクトを選択。
2. **`Settings`** -> **`Deployment Protection`** に移動。
3. **`Password Protection`**（または `Vercel Authentication`）を有効化（**Enabled**）。
4. 訪問時に入力を求める **任意のパスワード** を設定します。
5. `Save` をクリックして保存します。

これで、ブラウザからサイトにアクセスした際に Vercel 公式のパスワード入力画面が表示され、正しくパスワードを入力するまで閲覧・操作が制限されます。

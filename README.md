# FastAPI Test アプリケーション

FastAPIとNext.jsを使ったシンプルなCRUDアプリケーションです。Docker Composeを使用してフロントエンド（ポート7777）とバックエンド（ポート7776）を構築しています。

## 構成

- **バックエンド**: FastAPI (Python 3.11)
- **フロントエンド**: Next.js (TypeScript + Tailwind CSS)
- **コンテナ**: Docker Compose

## 機能

- アイテムの作成、読み取り、更新、削除（CRUD操作）
- リアルタイム統計情報表示
- サーバーヘルスチェック
- レスポンシブデザイン

## セットアップ

### 前提条件

- Docker
- Docker Compose

### 起動方法

1. リポジトリをクローン
```bash
git clone <repository-url>
cd fastapi-test
```

2. Docker Composeでアプリケーションを起動
```bash
docker-compose up --build
```

3. ブラウザでアクセス
- フロントエンド: http://localhost:7777
- バックエンドAPI: http://localhost:7776
- APIドキュメント: http://localhost:7776/docs

## API エンドポイント

### アイテム関連
- `GET /items` - 全アイテムを取得
- `GET /items/{id}` - 特定のアイテムを取得
- `POST /items` - 新しいアイテムを作成
- `PUT /items/{id}` - アイテムを更新
- `DELETE /items/{id}` - アイテムを削除

### その他
- `GET /` - ルートエンドポイント
- `GET /health` - ヘルスチェック
- `GET /stats` - 統計情報を取得

## 開発

### バックエンド開発

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 7776
```

### フロントエンド開発

```bash
cd frontend
npm install
npm run dev
```

## 技術スタック

### バックエンド
- FastAPI
- Pydantic
- Uvicorn
- Python 3.11

### フロントエンド
- Next.js 14
- TypeScript
- Tailwind CSS
- Axios


## SocketIO テスト環境も実施
リアルタイム双方向通信をテストするためのSocketIOは下記
詳細は [README-socketio.md](./README-socketio.md) を参照してください。


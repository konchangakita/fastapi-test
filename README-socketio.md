# SocketIO テスト環境

シンプルなSocketIOテスト環境です。FastAPI + python-socketio のバックエンドと Next.js + socket.io-client のフロントエンドで構成されています。

## 構成

- **バックエンド**: FastAPI + python-socketio
- **フロントエンド**: Next.js + TypeScript + socket.io-client

## 詳細ガイド

実装の詳細な手順については、[SocketIO Step by Step 実装ガイド](./socketio-step-by-step-guide.md)を参照してください。

## 起動方法

```bash
# SocketIO環境を起動
docker-compose -f docker-compose-socketio.yml up --build

# バックグラウンドで起動
docker-compose -f docker-compose-socketio.yml up --build -d
```

## アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **ヘルスチェック**: http://localhost:8000/health

## 機能

### バックエンド機能
- クライアント接続/切断の管理
- 全クライアントへのメッセージブロードキャスト
- ルーム機能（参加/退出/ルーム内メッセージ）

### フロントエンド機能
- リアルタイム接続状態表示
- メッセージ送受信
- ルーム参加/退出
- ルーム内メッセージ送受信

## 停止方法

```bash
docker-compose -f docker-compose-socketio.yml down
```

## 開発

### バックエンド開発
```bash
cd socketio-backend
pip install -r requirements.txt
python main.py
```

### フロントエンド開発
```bash
cd socketio-frontend
npm install
npm run dev
```

# SocketIO チャットルーム

SocketIOを使ったリアルタイムチャットルームアプリケーションです。FastAPI + python-socketio 5.13.0 のバックエンドと Next.js + socket.io-client のフロントエンドで構成されています。

## 構成

- **バックエンド**: FastAPI + python-socketio 5.13.0 + python-engineio 4.12.2
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
- ルーム参加・退出の通知機能
- 非同期ルーム管理（await enter_room/leave_room）

### フロントエンド機能
- リアルタイム接続状態表示
- メッセージ送受信（全体・ルーム内）
- ルーム参加/退出
- ルーム内メッセージ送受信
- ルーム参加・退出の通知表示
- デバッグ用コンソールログ

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

**依存関係:**
- python-socketio==5.13.0
- python-engineio==4.12.2
- fastapi==0.104.1
- uvicorn[standard]==0.24.0

**フロントエンド依存関係:**
- socket.io-client==4.7.2
- @types/socket.io-client==1.4.36
- next==14.0.0
- react==18.2.0

### フロントエンド開発
```bash
cd socketio-frontend
npm install
npm run dev
```

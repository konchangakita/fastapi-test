# SocketIO Step by Step 実装ガイド

FastAPI + Next.js でSocketIOを使ったリアルタイム通信アプリケーションを段階的に実装する完全ガイドです。

## 目次

1. [Step 1: SocketIOの基礎知識と環境構築](#step-1-socketioの基礎知識と環境構築)
2. [Step 2: SocketIO接続・切断と状態管理の実装](#step-2-socketio接続・切断と状態管理の実装)
3. [Step 3: チャットルーム機能の実装](#step-3-チャットルーム機能の実装)

---

## Step 1: SocketIOの基礎知識と環境構築

### SocketIOとは

Socket.IOは、リアルタイム双方向通信を実現するJavaScriptライブラリです。WebSocketをベースにしながら、古いブラウザでも動作するようにポーリング（polling）フォールバック機能を提供します。

#### 主な特徴
- **リアルタイム通信**: サーバーとクライアント間でリアルタイムにデータを送受信
- **双方向通信**: サーバーからクライアント、クライアントからサーバーへの通信が可能
- **自動フォールバック**: WebSocketが利用できない場合は自動的にポーリングに切り替え
- **ルーム機能**: 特定のクライアントグループ間での通信が可能
- **イベント駆動**: カスタムイベントを定義して通信を管理

### 必要なモジュールとバージョン

#### バックエンド（Python + FastAPI）

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-socketio==5.13.0
python-engineio==4.12.2
python-multipart==0.0.6
```

**重要なバージョン選択理由:**
- `python-socketio==5.13.0`: 最新の安定版、Socket.IOプロトコル4.xに対応
- `python-engineio==4.12.2`: 上記バージョンとの互換性を保つため
- `fastapi==0.104.1`: 最新の安定版

#### フロントエンド（Next.js + React）

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.7.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/socket.io-client": "^1.4.36",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

**重要なバージョン選択理由:**
- `socket.io-client==4.7.2`: バックエンドのpython-socketio 5.13.0と互換性がある（Engine.IO 4.xプロトコル）
- `@types/socket.io-client==1.4.36`: TypeScript型定義
- `next==14.0.0`: App Routerを使用するため

### プロジェクト構造

```
fastapi-test/
├── socketio-backend/
│   ├── main.py              # FastAPI + SocketIOサーバー
│   ├── requirements.txt     # Python依存関係
│   └── Dockerfile          # バックエンド用Dockerfile
├── socketio-frontend/
│   ├── app/
│   │   ├── page.tsx        # メインページ
│   │   ├── layout.tsx      # ルートレイアウト
│   │   └── globals.css     # グローバルスタイル
│   ├── package.json        # Node.js依存関係
│   ├── next.config.js      # Next.js設定
│   ├── tsconfig.json       # TypeScript設定
│   └── Dockerfile          # フロントエンド用Dockerfile
└── docker-compose-socketio.yml  # Docker Compose設定
```

### Docker Compose設定

```yaml
version: '3.8'

services:
  socketio-backend:
    build: ./socketio-backend
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1

  socketio-frontend:
    build: ./socketio-frontend
    ports:
      - "3000:3000"
    depends_on:
      - socketio-backend
    environment:
      - NODE_ENV=development
```

### バージョン互換性の重要性

Socket.IOのクライアントとサーバーは、プロトコルバージョンが一致している必要があります。

- **Socket.IO 2.x**: プロトコルバージョン2
- **Socket.IO 4.x**: プロトコルバージョン4

今回の構成では、python-socketio 5.13.0（Engine.IO 4.xプロトコル）とsocket.io-client 4.7.2（Engine.IO 4.xプロトコル）を使用しており、完全に互換性が保たれています。

---

## Step 2: SocketIO接続・切断と状態管理の実装

### 概要

このステップでは、SocketIOの基本的な接続・切断機能と状態管理を実装します。複雑な機能は含まず、接続状態の表示と手動での接続制御に焦点を当てます。

### バックエンド実装

#### 基本的なSocketIOサーバー設定

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn

# FastAPIアプリケーションの作成
app = FastAPI(title="SocketIO Test Backend")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SocketIOサーバーの作成
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode='asgi',
    logger=True,
    engineio_logger=True
)

# SocketIOをFastAPIに統合
socket_app = socketio.ASGIApp(sio, app)
```

#### 接続・切断イベントハンドラー

```python
@sio.event
async def connect(sid, environ, auth=None):
    print(f"クライアント {sid} が接続しました")

@sio.event
async def disconnect(sid):
    print(f"クライアント {sid} が切断しました")
```

#### ヘルスチェックエンドポイント

```python
@app.get("/")
async def root():
    return {"message": "SocketIO Test Backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)
```

### フロントエンド実装

#### 基本的なコンポーネント構造

```typescript
'use client'

import React, { useState } from 'react'
import io from 'socket.io-client'

type Socket = ReturnType<typeof io>

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  // 接続・切断関数は次のセクションで実装
}
```

#### 接続機能の実装

```typescript
const connectSocket = () => {
  if (socket && connected) {
    console.log('既に接続されています')
    return
  }

  console.log('SocketIO接続を開始します...')
  const newSocket = io(`${window.location.protocol}//${window.location.hostname}:8000`)
  
  // 接続成功時の処理
  newSocket.on('connect', () => {
    console.log('サーバーに接続しました')
    setConnected(true)
  })

  // 切断時の処理
  newSocket.on('disconnect', () => {
    console.log('サーバーから切断されました')
    setConnected(false)
  })

  // エラー時の処理
  newSocket.on('connect_error', (error: any) => {
    console.error('接続エラー:', error)
  })

  setSocket(newSocket)
  console.log('SocketIOオブジェクトを設定しました')
}
```

#### 切断機能の実装

```typescript
const disconnectSocket = () => {
  if (socket) {
    socket.close()
    setSocket(null)
    setConnected(false)
    console.log('手動で切断しました')
  }
}
```

#### UI実装

```typescript
return (
  <div className="container">
    <h1>SocketIO テスト環境 (Next.js App Router)</h1>
    
    <div className="card">
      <h2>接続状態</h2>
      <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '接続中' : '切断中'}
      </div>
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={connectSocket} 
          className="button connect" 
          disabled={connected}
        >
          接続
        </button>
        <button 
          onClick={disconnectSocket} 
          className="button disconnect" 
          disabled={!connected}
        >
          切断
        </button>
      </div>
    </div>

  </div>
)
```

#### スタイリング

```css
.status {
  padding: 10px 15px;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.status.connected {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.disconnected {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.button.connect {
  background-color: #28a745;
}

.button.connect:hover:not(:disabled) {
  background-color: #218838;
}

.button.disconnect {
  background-color: #dc3545;
}

.button.disconnect:hover:not(:disabled) {
  background-color: #c82333;
}
```

### 動作確認

#### 1. 接続テスト
1. ブラウザで http://localhost:3000 または http://[IPアドレス]:3000 にアクセス
2. 「接続」ボタンをクリック
3. 状態が「接続中」に変わることを確認
4. コンソールに「サーバーに接続しました」が表示されることを確認

**注意**: IPアドレスでアクセスする場合、フロントエンドのコードが自動的に同じIPアドレスの8000番ポートに接続します。

#### 2. 切断テスト
1. 「切断」ボタンをクリック
2. 状態が「切断中」に変わることを確認
3. コンソールに「手動で切断しました」が表示されることを確認


### 重要なポイント

#### 1. 接続状態の管理
- `connected` stateで接続状態を追跡
- ボタンの有効/無効を状態に基づいて制御

#### 2. SocketIOオブジェクトの管理
- `socket` stateでSocketIOインスタンスを保持
- 接続時に新しいインスタンスを作成
- 切断時にインスタンスをクリア

#### 3. エラーハンドリング
- `connect_error`イベントで接続エラーをキャッチ
- コンソールログでデバッグ情報を出力

#### 4. 動的URL設定
- `window.location.hostname`を使用して、localhostでもIPアドレスでも動作するように設定
- プロトコルも`window.location.protocol`で動的に取得


---

## Step 3: チャットルーム機能の実装

### 概要

このステップでは、SocketIOのルーム機能を使用してチャットルームを実装します。複数のユーザーが特定のルームに参加し、そのルーム内でのみメッセージを送受信できる機能を追加します。

### バックエンド実装

#### ルーム管理イベントハンドラー

```python
@sio.event
async def join_room(sid, data):
    room = data['room']
    sio.enter_room(sid, room)
    print(f"クライアント {sid} がルーム {room} に参加しました")
    # ルーム内の全メンバーに参加通知を送信
    await sio.emit('room_message', {'data': f'クライアント {sid} がルーム {room} に参加しました'}, room=room)

@sio.event
async def leave_room(sid, data):
    room = data['room']
    sio.leave_room(sid, room)
    print(f"クライアント {sid} がルーム {room} から退出しました")
    # ルーム内の全メンバーに退出通知を送信
    await sio.emit('room_message', {'data': f'クライアント {sid} がルーム {room} から退出しました'}, room=room)
```

#### ルーム内メッセージ送信

```python
@sio.event
async def room_message(sid, data):
    room = data['room']
    message = data['message']
    print(f"ルーム {room} でメッセージ受信: {message}")
    # ルーム内の全メンバーにメッセージを送信
    await sio.emit('room_message', {'data': f"クライアント {sid}: {message}"}, room=room)
```

#### 全体メッセージ送信（既存）

```python
@sio.event
async def send_message(sid, data):
    print(f"メッセージ受信: {data}")
    # 全クライアントにメッセージをブロードキャスト
    await sio.emit('message', {'data': f"クライアント {sid}: {data['message']}"})
```

### フロントエンド実装

#### 状態管理の拡張

```typescript
export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [roomInput, setRoomInput] = useState('')
  const [currentRoom, setCurrentRoom] = useState('')

  // 接続・切断関数は前のステップと同じ
}
```

#### ルーム参加機能

```typescript
const joinRoom = () => {
  if (socket && connected && roomInput.trim()) {
    socket.emit('join_room', { room: roomInput })
    setCurrentRoom(roomInput)
    setRoomInput('')
  }
}
```

#### ルーム退出機能

```typescript
const leaveRoom = () => {
  if (socket && connected && currentRoom) {
    socket.emit('leave_room', { room: currentRoom })
    setCurrentRoom('')
  }
}
```

#### メッセージ送信機能

```typescript
const sendMessage = () => {
  if (socket && connected && messageInput.trim()) {
    socket.emit('send_message', { message: messageInput })
    setMessageInput('')
  }
}

const sendRoomMessage = () => {
  if (socket && connected && messageInput.trim() && currentRoom) {
    socket.emit('room_message', { room: currentRoom, message: messageInput })
    setMessageInput('')
  }
}
```

#### イベントリスナーの設定

```typescript
const connectSocket = () => {
  // ... 既存の接続処理 ...

  // 全体メッセージ受信
  newSocket.on('message', (data: Message) => {
    console.log('メッセージ受信:', data)
    setMessages((prev: string[]) => [...prev, data.data])
  })

  // ルームメッセージ受信
  newSocket.on('room_message', (data: Message) => {
    console.log('ルームメッセージ受信:', data)
    setMessages((prev: string[]) => [...prev, `[ルーム] ${data.data}`])
  })

  // ... 既存の処理 ...
}
```

#### UI実装

```typescript
return (
  <div className="container">
    <h1>SocketIO テスト環境 (Next.js App Router)</h1>
    
    {/* 接続状態セクション */}
    <div className="card">
      <h2>接続状態</h2>
      <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '接続中' : '切断中'}
      </div>
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={connectSocket} 
          className="button connect" 
          disabled={connected}
        >
          接続
        </button>
        <button 
          onClick={disconnectSocket} 
          className="button disconnect" 
          disabled={!connected}
        >
          切断
        </button>
      </div>
    </div>

    {/* ルーム管理セクション */}
    <div className="card">
      <h2>ルーム管理</h2>
      <div>
        <input
          type="text"
          placeholder="ルーム名を入力"
          value={roomInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomInput(e.target.value)}
          className="input"
        />
        <button onClick={joinRoom} className="button" disabled={!connected}>
          ルームに参加
        </button>
        {currentRoom && (
          <button onClick={leaveRoom} className="button">
            ルームから退出 ({currentRoom})
          </button>
        )}
      </div>
    </div>

    {/* メッセージセクション */}
    <div className="card">
      <h2>メッセージ</h2>
      <div className="message-list">
        {messages.map((msg: string, index: number) => (
          <div key={index} className="message">
            {msg}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          placeholder="メッセージを入力"
          value={messageInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageInput(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (currentRoom ? sendRoomMessage() : sendMessage())}
          className="input"
        />
        <button 
          onClick={currentRoom ? sendRoomMessage : sendMessage} 
          className="button"
          disabled={!connected}
        >
          {currentRoom ? 'ルームに送信' : '送信'}
        </button>
      </div>
    </div>
  </div>
)
```

#### スタイリング

```css
.message {
  padding: 8px 12px;
  margin-bottom: 5px;
  background-color: white;
  border-radius: 4px;
  border-left: 3px solid #007bff;
  word-wrap: break-word;
}

/* ルームメッセージのスタイル */
.message:contains("[ルーム]") {
  border-left-color: #28a745;
  background-color: #f8f9fa;
}

.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 10px;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
```

### 動作確認

#### 1. ルーム参加テスト
1. 接続状態で「ルーム名を入力」フィールドに「test-room」と入力
2. 「ルームに参加」ボタンをクリック
3. 現在のルームが「test-room」に変わることを確認
4. メッセージリストに「[ルーム] クライアント XXX がルーム test-room に参加しました」が表示されることを確認

#### 2. ルーム内メッセージテスト
1. ルーム参加状態でメッセージを入力
2. Enterキーまたは「ルームに送信」ボタンをクリック
3. メッセージが「[ルーム] クライアント XXX: メッセージ内容」として表示されることを確認

#### 3. ルーム退出テスト
1. 「ルームから退出 (test-room)」ボタンをクリック
2. 現在のルームが空になることを確認
3. メッセージリストに退出通知が表示されることを確認

#### 4. 全体メッセージテスト
1. ルームに参加していない状態でメッセージを送信
2. メッセージが「クライアント XXX: メッセージ内容」として表示されることを確認

### 重要なポイント

#### 1. ルーム管理
- `sio.enter_room(sid, room)`: クライアントをルームに参加させる
- `sio.leave_room(sid, room)`: クライアントをルームから退出させる
- `sio.emit(..., room=room)`: 特定のルーム内のメンバーにのみメッセージを送信

#### 2. メッセージの区別
- 全体メッセージ: `message`イベント
- ルームメッセージ: `room_message`イベント
- UI上で`[ルーム]`プレフィックスを付けて区別

#### 3. 状態管理
- `currentRoom`: 現在参加しているルームを追跡
- ルーム参加時は入力フィールドをクリア
- ルーム退出時は`currentRoom`をクリア

#### 4. ユーザビリティ
- ルーム参加時は「ルームに送信」ボタンに変更
- Enterキーでメッセージ送信が可能
- ルーム参加状態を視覚的に表示

## 完成した機能

- ✅ **接続・切断**: 手動でSocketIO接続を制御
- ✅ **状態表示**: 接続状態を視覚的に表示
- ✅ **ルーム参加・退出**: 特定のルームに参加/退出
- ✅ **ルーム内メッセージ**: ルーム内でのメッセージ送受信
- ✅ **全体メッセージ**: 全クライアントへのメッセージ送信
- ✅ **リアルタイム通信**: WebSocketによる双方向通信

## まとめ

このガイドでは、FastAPI + Next.js を使用してSocketIOによるリアルタイム通信アプリケーションを段階的に実装しました。

**Step 1**では、SocketIOの基礎知識と必要なモジュールのバージョン選択について説明しました。特に、クライアントとサーバー間のプロトコル互換性が重要であることを強調しました。

**Step 2**では、基本的な接続・切断機能と状態管理を実装しました。これにより、ユーザーが手動でSocketIO接続を制御できるようになりました。

**Step 3**では、チャットルーム機能を実装し、複数のユーザーが特定のルームでメッセージを送受信できるようになりました。

これで、SocketIOを使用した完全なリアルタイムチャットアプリケーションが完成しました！このアプリケーションは、実際のプロダクトでも使用できる基本的な機能を備えています。

## 次のステップ

このアプリケーションをさらに発展させるには、以下の機能を追加することを検討してください：

- ユーザー認証とセッション管理
- メッセージの永続化（データベース保存）
- ファイルアップロード機能
- プライベートメッセージ機能
- オンラインユーザーリスト表示
- メッセージの編集・削除機能
- 絵文字やスタンプ機能

SocketIOの強力な機能を活用して、より豊富なリアルタイム通信アプリケーションを構築してください！

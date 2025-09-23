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

@sio.event
async def connect(sid, environ, auth=None):
    print(f"クライアント {sid} が接続しました")

@sio.event
async def disconnect(sid):
    print(f"クライアント {sid} が切断しました")

# ルーム管理イベントハンドラー
@sio.event
async def join_room(sid, data):
    room = data['room']
    await sio.enter_room(sid, room)
    print(f"クライアント {sid} がルーム {room} に参加しました")
    # ルーム内の全メンバーに参加通知を送信
    await sio.emit('room_notification', {'data': f'ユーザーがルーム {room} に参加しました'}, to=room)

@sio.event
async def leave_room(sid, data):
    room = data['room']
    await sio.leave_room(sid, room)
    print(f"クライアント {sid} がルーム {room} から退出しました")
    # ルーム内の全メンバーに退出通知を送信
    await sio.emit('room_notification', {'data': f'ユーザーがルーム {room} から退出しました'}, to=room)

# ルーム内メッセージ送信
@sio.event
async def room_message(sid, data):
    room = data['room']
    message = data['message']
    print(f"ルーム {room} でメッセージ受信: {message}")
    # ルーム内の全メンバーにメッセージを送信
    await sio.emit('room_message', {'data': f"ユーザー: {message}"}, to=room)

# 全体メッセージ送信
@sio.event
async def send_message(sid, data):
    print(f"メッセージ受信: {data}")
    # 全クライアントにメッセージをブロードキャスト
    await sio.emit('message', {'data': f"ユーザー: {data['message']}"})

@app.get("/")
async def root():
    return {"message": "SocketIO Test Backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)

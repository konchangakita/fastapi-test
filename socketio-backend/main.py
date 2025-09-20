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
    sio.emit('message', {'data': f'クライアント {sid} が接続しました'}, to=sid)

@sio.event
async def disconnect(sid):
    print(f"クライアント {sid} が切断しました")

@sio.event
async def send_message(sid, data):
    print(f"メッセージ受信: {data}")
    # 全クライアントにメッセージをブロードキャスト
    sio.emit('message', {'data': f"クライアント {sid}: {data['message']}"})

@sio.event
async def join_room(sid, data):
    room = data['room']
    sio.enter_room(sid, room)
    print(f"クライアント {sid} がルーム {room} に参加しました")
    sio.emit('room_message', {'data': f'クライアント {sid} がルーム {room} に参加しました'}, room=room)

@sio.event
async def leave_room(sid, data):
    room = data['room']
    sio.leave_room(sid, room)
    print(f"クライアント {sid} がルーム {room} から退出しました")
    sio.emit('room_message', {'data': f'クライアント {sid} がルーム {room} から退出しました'}, room=room)

@sio.event
async def room_message(sid, data):
    room = data['room']
    message = data['message']
    print(f"ルーム {room} でメッセージ受信: {message}")
    sio.emit('room_message', {'data': f"クライアント {sid}: {message}"}, room=room)

@app.get("/")
async def root():
    return {"message": "SocketIO Test Backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)

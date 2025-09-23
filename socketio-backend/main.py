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

@app.get("/")
async def root():
    return {"message": "SocketIO Test Backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)

'use client'

import React, { useState } from 'react'
import io from 'socket.io-client'

type Socket = ReturnType<typeof io>

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  const connectSocket = () => {
    if (socket && connected) {
      console.log('既に接続されています')
      return
    }

    console.log('SocketIO接続を開始します...')
    const newSocket = io('http://localhost:8000', {
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000,
      forceNew: true
    })
    
    newSocket.on('connect', () => {
      console.log('サーバーに接続しました')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('サーバーから切断されました')
      setConnected(false)
    })

    newSocket.on('connect_error', (error: any) => {
      console.error('接続エラー:', error)
    })

    setSocket(newSocket)
    console.log('SocketIOオブジェクトを設定しました')
  }

  const disconnectSocket = () => {
    if (socket) {
      socket.close()
      setSocket(null)
      setConnected(false)
      console.log('手動で切断しました')
    }
  }

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
}

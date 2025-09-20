'use client'

import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

interface Message {
  data: string
}

type Socket = ReturnType<typeof io>

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [roomInput, setRoomInput] = useState('')
  const [currentRoom, setCurrentRoom] = useState('')

  const connectSocket = () => {
    if (socket && connected) {
      console.log('既に接続されています')
      return
    }

    console.log('SocketIO接続を開始します...')
    console.log('接続先URL:', 'http://localhost:8000')
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

    newSocket.on('message', (data: Message) => {
      console.log('メッセージ受信:', data)
      setMessages((prev: string[]) => [...prev, data.data])
    })

    newSocket.on('room_message', (data: Message) => {
      console.log('ルームメッセージ受信:', data)
      setMessages((prev: string[]) => [...prev, `[ルーム] ${data.data}`])
    })

    setSocket(newSocket)
    console.log('SocketIOオブジェクトを設定しました')
  }

  const disconnectSocket = () => {
    if (socket) {
      socket.close()
      setSocket(null)
      setConnected(false)
      setCurrentRoom('')
      console.log('手動で切断しました')
    }
  }

  const sendMessage = () => {
    if (socket && connected && messageInput.trim()) {
      socket.emit('send_message', { message: messageInput })
      setMessageInput('')
    }
  }

  const joinRoom = () => {
    if (socket && connected && roomInput.trim()) {
      socket.emit('join_room', { room: roomInput })
      setCurrentRoom(roomInput)
      setRoomInput('')
    }
  }

  const leaveRoom = () => {
    if (socket && connected && currentRoom) {
      socket.emit('leave_room', { room: currentRoom })
      setCurrentRoom('')
    }
  }

  const sendRoomMessage = () => {
    if (socket && connected && messageInput.trim() && currentRoom) {
      socket.emit('room_message', { room: currentRoom, message: messageInput })
      setMessageInput('')
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
}

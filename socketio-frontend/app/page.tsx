'use client'

import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

type Socket = ReturnType<typeof io>
type Message = { data: string }

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [roomInput, setRoomInput] = useState('')
  const [currentRoom, setCurrentRoom] = useState('')

  // メッセージの変更を監視
  useEffect(() => {
    console.log('現在のメッセージ数:', messages.length)
    console.log('メッセージ内容:', messages)
  }, [messages])

  const connectSocket = () => {
    if (socket && connected) {
      console.log('既に接続されています')
      return
    }

    console.log('SocketIO接続を開始します...')
    const newSocket = io(`${window.location.protocol}//${window.location.hostname}:8000`)
    
    // イベントリスナーを先に登録
    console.log('イベントリスナーを登録中...')
    
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
      setConnected(false)
    })

    // 全体メッセージ受信
    newSocket.on('message', (data: Message) => {
      console.log('メッセージ受信:', data)
      setMessages((prev: string[]) => {
        const newMessages = [...prev, data.data]
        console.log('更新後のメッセージリスト:', newMessages)
        return newMessages
      })
    })

    // ルームメッセージ受信
    newSocket.on('room_message', (data: Message) => {
      console.log('ルームメッセージ受信:', data)
      setMessages((prev: string[]) => {
        const newMessages = [...prev, `[ルーム] ${data.data}`]
        console.log('更新後のメッセージリスト:', newMessages)
        return newMessages
      })
    })

    // ルーム通知受信
    newSocket.on('room_notification', (data: Message) => {
      console.log('ルーム通知受信:', data)
      setMessages((prev: string[]) => {
        const newMessages = [...prev, `[通知] ${data.data}`]
        console.log('更新後のメッセージリスト:', newMessages)
        return newMessages
      })
    })

    console.log('イベントリスナー登録完了')
    setSocket(newSocket)
    console.log('SocketIOオブジェクトを設定しました')
  }

  const disconnectSocket = () => {
    if (socket) {
      socket.close()
      setSocket(null)
      setConnected(false)
      setCurrentRoom('')
      setMessages([])
      console.log('手動で切断しました')
    }
  }

  // ルーム参加機能
  const joinRoom = () => {
    if (socket && connected && roomInput.trim()) {
      console.log('ルーム参加を送信:', { room: roomInput })
      socket.emit('join_room', { room: roomInput })
      setCurrentRoom(roomInput)
      setRoomInput('')
    } else {
      console.log('ルーム参加条件チェック:', { socket: !!socket, connected, roomInput })
    }
  }

  // ルーム退出機能
  const leaveRoom = () => {
    if (socket && connected && currentRoom) {
      socket.emit('leave_room', { room: currentRoom })
      setCurrentRoom('')
    }
  }

  // メッセージ送信機能
  const sendMessage = () => {
    if (socket && connected && messageInput.trim()) {
      socket.emit('send_message', { message: messageInput })
      setMessageInput('')
    }
  }

  const sendRoomMessage = () => {
    if (socket && connected && messageInput.trim() && currentRoom) {
      console.log('ルームメッセージを送信:', { room: currentRoom, message: messageInput })
      socket.emit('room_message', { room: currentRoom, message: messageInput })
      setMessageInput('')
    } else {
      console.log('ルームメッセージ送信条件チェック:', { socket: !!socket, connected, messageInput, currentRoom })
    }
  }

  return (
    <div className="container">
      <h1>SocketIO チャットルーム (Next.js App Router)</h1>
      
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
}

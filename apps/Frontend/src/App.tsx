import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState('Disconnected')
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080')
    wsRef.current = ws

    ws.onopen = () => setStatus('Connected')
    ws.onclose = () => setStatus('Disconnected')
    ws.onerror = () => setStatus('Error')
    ws.onmessage = (e) => setMessages((prev) => [...prev, `Server: ${e.data}`])

    return () => ws.close()
  }, [])

  const send = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(input)
      setMessages((prev) => [...prev, `You: ${input}`])
      setInput('')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>WebSocket Status: {status}</h2>
      <div style={{ marginBottom: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message..."
        />
        <button onClick={send}>Send</button>
      </div>
      <div style={{ border: '1px solid #ccc', padding: 10, height: 200, overflow: 'auto' }}>
        {messages.map((m, i) => <div key={i}>{m}</div>)}
      </div>
    </div>
  )
}

export default App

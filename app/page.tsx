'use client'
import { useState } from 'react'
import { Send, Bot, User, AlertTriangle, ShieldCheck } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  type: 'safe' | 'alert'
  timestamp: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage: Message = { role: 'user', content: input, type: 'safe', timestamp: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })
      if (!res.ok) throw new Error('Failed to get response')
      const data = await res.json()
      
      // Determine message type based on AI reply
      const type = data.reply.startsWith('🚨') ? 'alert' : 'safe'
      const assistantMessage: Message = { role: 'assistant', content: data.reply, type, timestamp: new Date().toLocaleTimeString() }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, error processing message.', type: 'alert', timestamp: new Date().toLocaleTimeString() }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const totalAlerts = messages.filter(m => m.type === 'alert').length
  const totalSafe = messages.filter(m => m.type === 'safe' && m.role === 'assistant').length

  return (
    <main className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col space-y-6">
        <h1 className="text-2xl font-bold mb-4">Phantom Guard</h1>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="text-green-400" /> 
            <span>Safe Messages: {totalSafe}</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-500" /> 
            <span>Alerts: {totalAlerts}</span>
          </div>
        </div>
        <div className="text-gray-400 mt-auto text-sm">
          Ghost account simulation system for detecting fraud patterns
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, idx) => (
            <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-2 rounded-lg break-words
                ${message.type === 'alert' ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}`}>
                <div className="flex justify-between items-center text-sm opacity-80">
                  <span>{message.role === 'user' ? 'You' : 'Phantom Guard'}</span>
                  <span>{message.timestamp}</span>
                </div>
                <p className="mt-1">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start space-x-2 animate-pulse">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              <div className="bg-green-700 text-white px-4 py-2 rounded-lg">Analyzing...</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 flex space-x-4 bg-gray-800">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a suspicious or fraudulent message..."
            className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </main>
  )
}

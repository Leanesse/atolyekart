import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// AtölyeKart sohbet asistanı (n8n AI Agent + RAG + hafıza).
// mode: 'window' → sağ altta yüzen sohbet baloncuğu.
import { createChat } from '@n8n/chat/dist/chat.es.js'
import '@n8n/chat/dist/style.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

const mountChat = () => {
  const target = document.createElement('div')
  target.id = 'atolyekart-chat'
  document.body.appendChild(target)
  createChat({
    target,
    props: {
      webhookUrl: 'https://atolyekart-n8n.tail204537.ts.net/webhook/333f83a4-8a34-4e02-9a55-70c46e2ac001/chat',
      mode: 'window',
      locale: 'tr',
      chatInputKey: 'chatInput',
      webSocketUrl: '',
      initialMessages: [
        'Merhaba! Ben AtölyeKart asistanı. 🛠️\nParçalar, stok durumu, kargo/iade veya özel baskı teklifi için sorabilirsin.',
      ],
    },
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountChat)
} else {
  mountChat()
}

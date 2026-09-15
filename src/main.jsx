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
    webhookUrl: 'https://atolyekart-n8n.tail204537.ts.net/webhook/333f83a4-8a34-4e02-9a55-70c46e2ac001/chat',
    mode: 'window',
    showWindowCloseButton: true,
    defaultLanguage: 'tr',
    showWelcomeScreen: false,
    loadPreviousSession: true,
    initialMessages: [
      'Merhaba! 👋 Ben AtölyeKart asistanı.\nÜrünler, stok durumu, kargo/iade veya özel baskı teklifi için sorabilirsin.',
    ],
    i18n: {
      tr: {
        title: 'AtölyeKart Asistanı',
        subtitle: 'Stok, kargo, iade ve özel baskı soruların için buradayım.',
        getStarted: 'Yeni Sohbet',
        inputPlaceholder: 'Sorunu yaz…',
        closeButtonTooltip: 'Sohbeti kapat',
        repostButton: 'Mesajı tekrar gönder',
        reuseButton: 'Mesajı yeniden kullan',
        footer: '',
      },
    },
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountChat)
} else {
  mountChat()
}

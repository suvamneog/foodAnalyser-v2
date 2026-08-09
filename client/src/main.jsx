import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom"
import { Analytics } from "@vercel/analytics/react"
import App from './App.jsx'

// SPA navigations (category → home results) must not restore a previous mid-page scroll.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <App />
    <Analytics />
    </BrowserRouter>
)

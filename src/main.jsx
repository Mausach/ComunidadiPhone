import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css'; // Importa los estilos CSS de Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importa los estilos CSS de Bootstrap Icons
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { KeyboardControls } from '@react-three/drei'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KeyboardControls
      map={[
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
        { name: 'space', keys: ['Space'] }
      ]}
    >
      <App />
    </KeyboardControls>
  </StrictMode>,
)

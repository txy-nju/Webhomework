import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Header ,{ShowActivity,CreateActivity}from './pages/Home/index.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header />
    <ShowActivity />
    <ShowActivity />
    <ShowActivity />
    <ShowActivity />
    <CreateActivity />
  </StrictMode>,
)

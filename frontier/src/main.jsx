import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Header ,{ShowActivity,CreateActivity}from './pages/Home/index.jsx'
const activity = {
  photo: 'https://via.placeholder.com/150',
  name: '活动名称',
  description: '活动描述'
};
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header />
    <ShowActivity activity={activity} />
    <ShowActivity activity={activity} />
    <ShowActivity activity={activity} />
    <CreateActivity />
  </StrictMode>,
)

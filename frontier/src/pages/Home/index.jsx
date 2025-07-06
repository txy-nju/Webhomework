//实现界面顶部的登录功能
import React from 'react'
import './style.css' // 建议单独写样式
import image from '../../assets/react.svg'
function Header() {
  return (
    <header className="fixed-header">
      <div className="header-content">
        <span>体育活动室</span>
        <button className="login-btn">登录</button>
      </div>
    </header>
  )
}
// 这里可以添加更多的功能，比如搜索框、导航菜单等


export default Header
// 接下来实现活动的展示页面ShowActivity
export function ShowActivity() {
  return (
    <div className="activity-box">
      <img
        className="activity-img"
        src={image}
        alt="活动图片"
      />
      <div className="activity-desc">
        <h2>活动名称</h2>
        <p>这里是活动的详细描述，可以介绍活动内容、时间、地点等信息。</p>
        <button className='buttonStyle'>了解详情</button>
      </div>
    </div>
  )
}

//添加功能：发起活动
export function CreateActivity() {
  return (
    <div>
      <h2>发起活动</h2>
      <button className="buttonStyle">发起活动</button>
      {/* 这里可以添加发起活动的表单或其他内容 */}
    </div>
  )
}

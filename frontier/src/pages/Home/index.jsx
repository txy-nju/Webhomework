//实现界面顶部的登录功能
import React from 'react'
import './style.css' // 建议单独写样式
//import Activity from '../../entity/Activity'
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
export function ShowActivity({ activity }) {
  return (
    <div className="activity-box">
      <img
        className="activity-img"
        src={activity.photo}
        alt="活动图片"
      />
      <div className="activity-desc">
        <h2>{activity.name}</h2>
        <p>{activity.description}</p>
        <button className='buttonStyle'>了解详情</button>
      </div>
    </div>
  )
}

//添加功能：发起活动
export function CreateActivity() {
  return (
    <div>
      <form className="create-activity-form">
        <input type="text" placeholder="活动名称" />
        <input type="text" placeholder="活动描述" />
        <input type="text" placeholder="活动时间" />
        <input type="file" />
        <button type="submit" className="buttonStyle">发起活动</button>
      </form>
    </div>
  )
}

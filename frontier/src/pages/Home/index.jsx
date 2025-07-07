//实现界面顶部的登录功能
import React, { useState } from 'react'
import './style.css' // 建议单独写样式
//import Activity from '../../entity/Activity'

function Header() {
  return (
    <header className="fixed-header">
      <div className="header-content">
        <span>体育活动室</span>
        <button className='logo-btn'>我的活动</button>
        <button className="login-btn">登录</button>
      </div>
    </header>
  )
}

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
export function CreateActivity({ onActivityCreated }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      time: formData.get('time'),
      photo: 'https://via.placeholder.com/150' // 默认图片
    };
    
    try {
      // 这里可以添加对 data 的处理逻辑，比如发送请求
      const res = await fetch('http://localhost:7001/api/activity/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        alert('活动创建成功');
        // 创建成功后，调用回调函数更新活动列表
        if (onActivityCreated) {
          onActivityCreated(data);
        }
        // 清空表单
        e.target.reset();
      } else {
        alert('活动创建失败');
      }
    } catch (error) {
      console.error('创建活动时出错:', error);
      alert('创建活动时出错，请重试');
    }
  };
  
  return (
    <div>
      <form className="create-activity-form" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="活动名称" required />
        <input type="text" name="description" placeholder="活动描述" required />
        <input type="text" name="time" placeholder="活动时间" required />
        <button type="submit" className="buttonStyle">发起活动</button>
      </form>
    </div>
  )
}

// 主页面组件，管理活动列表状态
export default function HomePage() {
  // 初始化一些示例活动
  const [activities, setActivities] = useState([
    {
      id: 1,
      photo: 'https://via.placeholder.com/150',
      name: '篮球比赛',
      description: '周末篮球友谊赛，欢迎大家参加！',
      time: '2025-07-12 14:00'
    },
    {
      id: 2,
      photo: 'https://via.placeholder.com/150',
      name: '羽毛球训练',
      description: '羽毛球基础训练课程',
      time: '2025-07-15 18:00'
    }
  ]);

  // 添加新活动的回调函数
  const handleActivityCreated = (newActivity) => {
    const activityWithId = {
      ...newActivity,
      id: Date.now() // 简单的ID生成，实际项目中应该使用更好的方式
    };
    setActivities(prevActivities => [activityWithId, ...prevActivities]);
  };

  return (
    <div>
      <Header />
      <div className="main-content">
        <div className="create-section">
          <h2>发起新活动</h2>
          <CreateActivity onActivityCreated={handleActivityCreated} />
        </div>
        <div className="activities-section">
          <h2>活动列表</h2>
          <div className="activities-list">
            {activities.map(activity => (
              <ShowActivity key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

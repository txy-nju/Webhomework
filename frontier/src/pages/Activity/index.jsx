import React from 'react';
import './style.css';

// 活动展示组件
export function ShowActivity({ activity, onDetailClick }) {
  const handleDetailClick = () => {
    // 处理查看详情逻辑
    if (onDetailClick) {
      onDetailClick(activity);
    }
  }

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
        <button className='buttonStyle' onClick={handleDetailClick}>了解详情</button>
      </div>
    </div>
  );
}

// 创建活动组件
export function CreateActivity({ onActivityCreated, user, isLoggedIn }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 检查登录状态
    if (!isLoggedIn || !user) {
      alert('请先登录后再创建活动');
      return;
    }
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      time: formData.get('time'),
      photo: 'https://via.placeholder.com/150', // 默认图片
      userId: user.id // 添加用户ID
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
        alert('活动创建失败：' + (result.message || '未知错误'));
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
  );
}

// 如果需要单独的Activity页面组件，可以在这里定义
function ActivityPage({ onBackToHome }) {
  return (
    <div>
      <h1>Activity Page</h1>
      <button onClick={onBackToHome}>返回首页</button>
    </div>
  );
}

export default ActivityPage;
//实现界面顶部的登录功能
import React, { useState, useEffect } from 'react'
import './style.css' // 建议单独写样式
import LoginPage from '../Login/index.jsx'
import ActivityDetail from '../ActivityDetail/index.jsx'
import { ShowActivity, CreateActivity } from '../Activity/index.jsx' // 从Activity导入组件
import ProfilePage from '../Profile/index.jsx'
import Ranking from '../Ranking/index.jsx'

function Header({ onLoginClick, onProfileClick, onLogout, onRankingClick, user, isLoggedIn }) {
  const handleLogin = () => {
    // 处理登录按钮点击事件
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleProfile = () => {
    // 处理个人资料按钮点击事件
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleLogout = () => {
    // 处理登出按钮点击事件
    if (onLogout) {
      onLogout();
    }
  };

  const handleRanking = () => {
    // 处理排行榜按钮点击事件
    if (onRankingClick) {
      onRankingClick();
    }
  };

  return (
    <header className="fixed-header">
      <div className="header-content">
        <span>🏃‍♂️ 体育活动室</span>
        <div className="header-nav">
          <button className='logo-btn' onClick={handleProfile}>📋 个人中心</button>
          <button className='ranking-btn' onClick={handleRanking}>🏆 排行榜</button>
        </div>
        {!isLoggedIn ? (
          <button className="login-btn" onClick={handleLogin}>🔐 登录</button>
        ) : (
          <div className="user-info">
            <span>欢迎回来，</span>
            <button className='user-btn'>{user?.username || '用户'}</button>
            <button className="logout-btn" onClick={handleLogout}>退出</button>
          </div>
        )}
      </div>
    </header>
  )
}

// 主页面组件，管理活动列表状态
export default function HomePage() {
  // 管理当前页面状态
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'activityDetail', 'profile', 'ranking'
  const [selectedActivity, setSelectedActivity] = useState(null); // 当前选中的活动
  // 提示：添加用户状态
  const [user, setUser] = useState(null); // null表示未登录
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 活动列表状态
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActivities, setFilteredActivities] = useState([]);

  // 检查localStorage中的登录状态
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
          const userData = JSON.parse(savedUserInfo);
          
          // 检查登录是否过期（可选：设置7天过期）
          const loginTime = userData.loginTime || 0;
          const currentTime = new Date().getTime();
          const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7天
          
          if (currentTime - loginTime < sevenDaysInMs) {
            // 登录未过期，恢复登录状态
            setUser(userData);
            setIsLoggedIn(true);
            console.log('从localStorage恢复登录状态:', userData);
          } else {
            // 登录已过期，清除localStorage
            localStorage.removeItem('userInfo');
            console.log('登录已过期，已清除本地存储');
          }
        }
      } catch (error) {
        console.error('检查登录状态时出错:', error);
        localStorage.removeItem('userInfo'); // 清除可能损坏的数据
      }
    };

    checkLoginStatus();
  }, []); // 组件挂载时执行一次

  // 获取所有活动
  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      // 这里应该调用获取所有活动的API
      // 目前我们用一个模拟的方式，之后需要实现后端的获取所有活动接口
      const response = await fetch('http://localhost:7001/api/activity/all');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setActivities(result.data);
        }
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
      // 如果API失败，使用一些基本的示例数据
      setActivities([
        {
          id: 1,
          photo: 'https://via.placeholder.com/150',
          name: '篮球比赛',
          description: '周末篮球友谊赛，欢迎大家参加！',
          time: '2025-07-12 14:00',
          location: '体育馆',
          maxParticipants: 20,
          status: 'active'
        },
        {
          id: 2,
          photo: 'https://via.placeholder.com/150',
          name: '羽毛球训练',
          description: '羽毛球基础训练课程',
          time: '2025-07-15 18:00',
          location: '羽毛球场',
          maxParticipants: 16,
          status: 'active'
        }
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // 页面加载时获取活动列表
  useEffect(() => {
    fetchActivities();
  }, []);

  // 搜索功能：当搜索关键词或活动列表变化时，更新过滤结果
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter(activity =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActivities(filtered);
    }
  }, [searchQuery, activities]);

  // 添加新活动的回调函数
  const handleActivityCreated = () => {
    // 重新获取活动列表以确保数据同步
    fetchActivities();
  };

  // 处理登录按钮点击
  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  // 处理返回首页
  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  // 处理登录状态
  const handleLoginSuccess = (userData) => {
    console.log('登录成功，用户数据:', userData); // 调试信息
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('home');
  }

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('home');
    alert('已成功登出');
  }

  // 处理查看活动详情
  const handleActivityDetail = (activity) => {
    console.log('查看活动详情:', activity);
    setSelectedActivity(activity);
    setCurrentPage('activityDetail');
  }

  const handleProfileClick =() => {
    if(isLoggedIn && user) {
      setCurrentPage('profile');
    }else {
      alert('请先登录！');
      setCurrentPage('login');
    }
  }

  // 处理排行榜按钮点击
  const handleRankingClick = () => {
    setCurrentPage('ranking');
  };

  // 处理搜索输入
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };


  // 根据当前页面状态渲染不同内容
  if (currentPage === 'login') {
    return (
      <div>
        <Header 
          onLoginClick={handleLoginClick} 
          onProfileClick={handleProfileClick} 
          onLogout={handleLogout} 
          onRankingClick={handleRankingClick}
          user={user} 
          isLoggedIn={isLoggedIn} 
        />
        <div className="main-content">
          <LoginPage onBackToHome={handleBackToHome} onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  if (currentPage === 'activityDetail') {
    return (
      <div>
        <Header 
          onLoginClick={handleLoginClick} 
          onProfileClick={handleProfileClick} 
          onLogout={handleLogout} 
          onRankingClick={handleRankingClick}
          user={user} 
          isLoggedIn={isLoggedIn} 
        />
        <ActivityDetail 
          activity={selectedActivity}
          onBackToHome={handleBackToHome}
          user={user}
          isLoggedIn={isLoggedIn}
        />
      </div>
    );
  }

  if (currentPage === 'profile') {
    return (
      <div>
        <Header 
          onLoginClick={handleLoginClick} 
          onProfileClick={handleProfileClick} 
          onLogout={handleLogout} 
          onRankingClick={handleRankingClick}
          user={user} 
          isLoggedIn={isLoggedIn} 
        />
        <div className="main-content">
          <ProfilePage user={user} isLoggedIn={isLoggedIn} onBackHome={handleBackToHome} />
        </div>
      </div>
    );
  }

  if (currentPage === 'ranking') {
    return (
      <div>
        <Header 
          onLoginClick={handleLoginClick} 
          onProfileClick={handleProfileClick} 
          onLogout={handleLogout} 
          onRankingClick={handleRankingClick}
          user={user} 
          isLoggedIn={isLoggedIn} 
        />
        <div className="main-content">
          <Ranking 
            onBackToHome={handleBackToHome} 
            user={user} 
            isLoggedIn={isLoggedIn} 
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        onLoginClick={handleLoginClick} 
        onProfileClick={handleProfileClick} 
        onLogout={handleLogout} 
        onRankingClick={handleRankingClick}
        user={user} 
        isLoggedIn={isLoggedIn} 
      />
      <div className="main-content">
        <div className="create-section">
          <h2>发起新活动</h2>
          <CreateActivity 
            onActivityCreated={handleActivityCreated} 
            user={user} 
            isLoggedIn={isLoggedIn} 
          />
        </div>
        <div className="activities-section">
          <h2>活动列表</h2>
          {/* 搜索框 */}
          <div className="search-bar">
            <div className="search-input-container">
              <input 
                type="text" 
                placeholder="搜索活动名称、描述或地点..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  title="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {/* 搜索结果统计 */}
          {searchQuery && (
            <div className="search-results-info">
              <p>找到 {filteredActivities.length} 个相关活动</p>
            </div>
          )}
          <div className="activities-list">
            {activitiesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>正在加载活动...</p>
              </div>
            ) : (filteredActivities.length > 0 ? (
              filteredActivities.map(activity => (
                <ShowActivity 
                  key={activity.id} 
                  activity={activity} 
                  onDetailClick={handleActivityDetail}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>暂无活动，快来创建第一个活动吧！</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import './style.css';
import ActivityCard from '../../components/ActivityCard';

function UserProfile({ targetUser, onBackToProfile, onViewActivity, currentUser, isLoggedIn }) {
  const [userInfo, setUserInfo] = useState(null);
  const [participatedActivities, setParticipatedActivities] = useState([]);
  const [createdActivities, setCreatedActivities] = useState([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 处理查看活动详情
  const handleViewDetail = (activity) => {
    console.log('UserProfile: 查看活动详情', activity);
    if (onViewActivity) {
      onViewActivity(activity);
    } else {
      console.error('UserProfile: onViewActivity 函数未定义');
    }
  };

  // 检查关注状态
  const checkFollowStatus = useCallback(async () => {
    if (!currentUser || currentUser.id === targetUser.id) return;
    
    try {
      const response = await fetch(`http://localhost:7001/api/follow/check?userId=${currentUser.id}&targetUserId=${targetUser.id}`);
      const result = await response.json();
      if (result.success) {
        setIsFollowing(result.data.isFollowing);
      }
    } catch (err) {
      console.error('检查关注状态失败:', err);
    }
  }, [currentUser, targetUser]);

  // 获取用户详细信息
  const fetchUserInfo = useCallback(async () => {
    try {
      setLoading(true);
      
      // 获取用户参与的活动
      const participatedResponse = await fetch(`http://localhost:7001/api/user/participated-activities?userId=${targetUser.id}`);
      const participatedResult = await participatedResponse.json();
      
      // 获取用户创建的活动
      const createdResponse = await fetch(`http://localhost:7001/api/user/created-activities?userId=${targetUser.id}`);
      const createdResult = await createdResponse.json();
      
      // 获取关注数量
      const followingResponse = await fetch(`http://localhost:7001/api/follow/following?userId=${targetUser.id}`);
      const followingResult = await followingResponse.json();
      
      // 获取粉丝数量
      const followersResponse = await fetch(`http://localhost:7001/api/follow/followers?userId=${targetUser.id}`);
      const followersResult = await followersResponse.json();
      
      if (participatedResult.success) {
        setParticipatedActivities(participatedResult.data);
      }
      
      if (createdResult.success) {
        setCreatedActivities(createdResult.data);
      }
      
      if (followingResult.success) {
        setFollowingCount(followingResult.data.length);
      }
      
      if (followersResult.success) {
        setFollowersCount(followersResult.data.length);
      }
      
      setUserInfo(targetUser);
      
      // 如果当前用户已登录且不是查看自己的资料，检查关注状态
      if (isLoggedIn && currentUser && currentUser.id !== targetUser.id) {
        await checkFollowStatus();
      }
    } catch (err) {
      setError('获取用户信息失败');
      console.error('获取用户信息失败:', err);
    } finally {
      setLoading(false);
    }
  }, [targetUser, currentUser, isLoggedIn, checkFollowStatus]);

  // 关注/取消关注用户
  const handleFollowUser = async () => {
    if (!isLoggedIn || !currentUser) {
      alert('请先登录');
      return;
    }

    if (currentUser.id === targetUser.id) {
      alert('不能关注自己');
      return;
    }

    try {
      const endpoint = isFollowing ? '/api/follow/unfollow' : '/api/follow/follow';
      const response = await fetch(`http://localhost:7001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: currentUser.id,
          followingId: targetUser.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setIsFollowing(!isFollowing);
        // 更新粉丝数量
        if (isFollowing) {
          setFollowersCount(prev => prev - 1);
          alert('取消关注成功');
        } else {
          setFollowersCount(prev => prev + 1);
          alert('关注成功');
        }
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      alert('网络错误，请稍后重试');
    }
  };

  useEffect(() => {
    if (targetUser) {
      fetchUserInfo();
    }
  }, [targetUser, fetchUserInfo]);

  if (loading) {
    return (
      <div className="user-profile">
        <div className="user-profile__loading">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile">
        <div className="user-profile__error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>重试</button>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="user-profile">
        <div className="user-profile__error">
          <p>用户信息不存在</p>
          <button onClick={onBackToProfile}>返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      {/* 页面头部 */}
      <div className="user-profile__header">
        <button className="back-button" onClick={onBackToProfile}>
          ← 返回
        </button>
        <h1>用户资料</h1>
      </div>

      {/* 用户信息卡片 */}
      <div className="user-info-card">
        <div className="user-avatar">
          <div className="avatar-circle">
            {userInfo.username.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="user-details">
          <h2 className="username">{userInfo.username}</h2>
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-number">{userInfo.score || 0}</span>
              <span className="stat-label">积分</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{followersCount}</span>
              <span className="stat-label">粉丝数</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{followingCount}</span>
              <span className="stat-label">关注数</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{createdActivities.length}</span>
              <span className="stat-label">创建活动</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{participatedActivities.length}</span>
              <span className="stat-label">参与活动</span>
            </div>
          </div>
          
          {/* 关注按钮 (只在查看他人资料时显示) */}
          {isLoggedIn && currentUser && currentUser.id !== targetUser.id && (
            <button 
              className={`follow-button ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowUser}
            >
              {isFollowing ? '已关注' : '关注'}
            </button>
          )}
        </div>
      </div>

      {/* 活动列表 */}
      <div className="user-activities">
        {/* 创建的活动 */}
        <div className="activity-section">
          <h3 className="section-title">创建的活动 ({createdActivities.length})</h3>
          {createdActivities.length > 0 ? (
            <div className="activity-grid">
              {createdActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onViewDetail={handleViewDetail}
                  isViewOnly={true}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>暂无创建的活动</p>
            </div>
          )}
        </div>

        {/* 参与的活动 */}
        <div className="activity-section">
          <h3 className="section-title">参与的活动 ({participatedActivities.length})</h3>
          {participatedActivities.length > 0 ? (
            <div className="activity-grid">
              {participatedActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onViewDetail={handleViewDetail}
                  isViewOnly={true}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>暂无参与的活动</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

import React, { useState, useEffect, useCallback } from 'react';
import './FollowList.css';

function FollowList({ user, type, onViewUserProfile }) {
  const [followList, setFollowList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取关注或粉丝列表
  const fetchFollowList = useCallback(async () => {
    if (!user || !user.id) return;
    
    try {
      setLoading(true);
      const endpoint = type === 'following' ? 'following' : 'followers';
      const response = await fetch(`http://localhost:7001/api/follow/${endpoint}?userId=${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setFollowList(result.data);
      } else {
        setError(result.message || '获取列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取关注列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [user, type]);

  useEffect(() => {
    fetchFollowList();
  }, [fetchFollowList]);

  if (loading) {
    return <div className="follow-list-loading">加载中...</div>;
  }

  if (error) {
    return (
      <div className="follow-list-error">
        <p>{error}</p>
        <button onClick={fetchFollowList} className="retry-btn">重试</button>
      </div>
    );
  }

  const title = type === 'following' ? '我的关注' : '我的粉丝';

  return (
    <div className="follow-list-container">
      <h3>{title} ({followList.length})</h3>
      {followList.length === 0 ? (
        <div className="empty-follow-list">
          <p>{type === 'following' ? '暂无关注的用户' : '暂无粉丝'}</p>
        </div>
      ) : (
        <div className="follow-items">
          {followList.map((followUser) => (
            <div 
              key={followUser.id} 
              className="follow-item clickable"
              onClick={() => onViewUserProfile(followUser)}
            >
              <div className="follow-user-avatar">
                <div className="avatar-circle">
                  {followUser.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="follow-user-info">
                <span className="follow-username">{followUser.username}</span>
                <span className="follow-score">{followUser.score || 0}积分</span>
              </div>
              <div className="follow-arrow">→</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FollowList;

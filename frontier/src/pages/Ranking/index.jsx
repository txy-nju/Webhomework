import React, { useState, useEffect, useCallback } from 'react';
import './style.css';

function Ranking({ onBackToHome, user, isLoggedIn }) {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  // 获取排行榜数据
  const fetchRankingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:7001/api/ranking/users');
      const result = await response.json();
      
      if (result.success) {
        setRankingData(result.data);
        
        // 如果用户已登录，找到当前用户的排名
        if (isLoggedIn && user && user.username) {
          const userRankInfo = result.data.find(rankUser => rankUser.username === user.username);
          setCurrentUserRank(userRankInfo || null);
        }
      } else {
        setError(result.message || '获取排行榜失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取排行榜数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    fetchRankingData();
  }, [fetchRankingData]); // 当fetchRankingData变化时重新获取数据

  // 获取排名样式
  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-first';
    if (rank === 2) return 'rank-second';
    if (rank === 3) return 'rank-third';
    return 'rank-normal';
  };

  // 获取排名图标
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  if (loading) {
    return (
      <div className="ranking-container">
        <div className="ranking-header">
          <h1>用户排行榜</h1>
          <button className="back-btn" onClick={onBackToHome}>
            返回首页
          </button>
        </div>
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-container">
        <div className="ranking-header">
          <h1>用户排行榜</h1>
          <button className="back-btn" onClick={onBackToHome}>
            返回首页
          </button>
        </div>
        <div className="error-message">{error}</div>
        <button className="retry-btn" onClick={fetchRankingData}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <h1>用户排行榜</h1>
        <button className="back-btn" onClick={onBackToHome}>
          返回首页
        </button>
      </div>
      
      <div className="ranking-content">
        <div className="ranking-info">
          <p>积分规则：创建活动并完成 +3分，参与活动并完成 +1分</p>
        </div>
        
        {/* 当前用户排名显示 */}
        {isLoggedIn && currentUserRank && (
          <div className="current-user-rank">
            <div className="current-user-info">
              <span className="current-user-label">您的排名：</span>
              <div className="current-user-details">
                <span className="current-rank">{getRankIcon(currentUserRank.rank)}</span>
                <span className="current-username">{currentUserRank.username}</span>
                <span className="current-score">{currentUserRank.score}积分</span>
              </div>
            </div>
          </div>
        )}
        
        {rankingData.length === 0 ? (
          <div className="empty-ranking">
            <p>暂无排行榜数据</p>
          </div>
        ) : (
          <div className="ranking-list">
            {rankingData.map((user) => (
              <div 
                key={user.id} 
                className={`ranking-item ${getRankClass(user.rank)} ${
                  isLoggedIn && currentUserRank && user.username === currentUserRank.username ? 'current-user' : ''
                }`}
              >
                <div className="rank-number">
                  {getRankIcon(user.rank)}
                </div>
                <div className="user-info">
                  <span className="username">{user.username}</span>
                  {isLoggedIn && currentUserRank && user.username === currentUserRank.username && (
                    <span className="current-user-badge">（你）</span>
                  )}
                </div>
                <div className="user-score">
                  <span className="score">{user.score}</span>
                  <span className="score-label">积分</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Ranking;

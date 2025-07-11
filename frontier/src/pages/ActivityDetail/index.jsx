import React, { useState, useEffect, useCallback } from 'react';
import './style.css';

function ActivityDetail({ activity, onBackToHome, user, isLoggedIn, startInEditMode = false, onActivityUpdated }) {
  const [participants, setParticipants] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isParticipating, setIsParticipating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivity, setEditedActivity] = useState({
    name: '',
    time: '',
    description: '',
    photo: '',
    status: 'active'
  });

  // 获取活动参与者
  const fetchParticipants = useCallback(async () => {
    if (!activity) return;
    try {
      const response = await fetch(`http://localhost:7001/api/activity/participants?activityId=${activity.id}`);
      const result = await response.json();
      if (result.success) {
        setParticipants(result.data);
      }
    } catch (error) {
      console.error('获取参与者失败:', error);
    }
  }, [activity]);

  // 获取活动评论
  const fetchComments = useCallback(async () => {
    if (!activity) return;
    try {
      const response = await fetch(`http://localhost:7001/api/activity/comments?activityId=${activity.id}`);
      const result = await response.json();
      if (result.success) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  }, [activity]);

  // 检查用户是否已参与活动
  const checkParticipation = useCallback(() => {
    if (user && participants.length > 0) {
      const participating = participants.some(p => p.id === user.id);
      setIsParticipating(participating);
    }
  }, [user, participants]);

  useEffect(() => {
    if (activity) {
      fetchParticipants();
      fetchComments();
    }
  }, [activity, fetchParticipants, fetchComments]);

  useEffect(() => {
    checkParticipation();
  }, [checkParticipation]);

  // 处理自动进入编辑模式
  useEffect(() => {
    if (startInEditMode && activity) {
      setEditedActivity({
        name: activity.name,
        time: activity.time,
        description: activity.description,
        photo: activity.photo,
        status: activity.status || 'active'
      });
      setIsEditing(true);
    }
  }, [startInEditMode, activity]);

  // 参与活动
  const handleJoinActivity = async () => {
    if (!isLoggedIn) {
      alert('请先登录');
      return;
    }

    try {
      const response = await fetch('http://localhost:7001/api/activity/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activityId: activity.id,
          userId: user.id
        })
      });
      const result = await response.json();
      
      if (result.success) {
        alert('成功参与活动！');
        setIsParticipating(true);
        fetchParticipants(); // 刷新参与者列表
      } else {
        alert(result.message || '参与活动失败');
      }
    } catch (error) {
      console.error('参与活动出错:', error);
      alert('参与活动时出错，请重试');
    }
  };

  // 退出活动
  const handleLeaveActivity = async () => {
    try {
      const response = await fetch('http://localhost:7001/api/activity/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activityId: activity.id,
          userId: user.id
        })
      });
      const result = await response.json();
      
      if (result.success) {
        alert('已退出活动');
        setIsParticipating(false);
        fetchParticipants(); // 刷新参与者列表
      } else {
        alert(result.message || '退出活动失败');
      }
    } catch (error) {
      console.error('退出活动出错:', error);
      alert('退出活动时出错，请重试');
    }
  };

  // 添加评论
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('请先登录');
      return;
    }

    if (!newComment.trim()) {
      alert('请输入评论内容');
      return;
    }

    try {
      const response = await fetch('http://localhost:7001/api/activity/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activityId: activity.id,
          userId: user.id,
          content: newComment.trim()
        })
      });
      const result = await response.json();
      
      if (result.success) {
        alert('评论添加成功！');
        setNewComment('');
        fetchComments(); // 刷新评论列表
      } else {
        alert(result.message || '添加评论失败');
      }
    } catch (error) {
      console.error('添加评论出错:', error);
      alert('添加评论时出错，请重试');
    }
  };

  // 开始编辑活动
  const handleStartEdit = () => {
    setEditedActivity({
      name: activity.name,
      time: activity.time,
      description: activity.description,
      photo: activity.photo,
      status: activity.status || 'active'
    });
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedActivity({
      name: '',
      time: '',
      description: '',
      photo: '',
      status: 'active'
    });
  };

  // 保存活动编辑
  const handleSaveEdit = async () => {
    if (!isLoggedIn) {
      alert('请先登录');
      return;
    }

    try {
      const response = await fetch('http://localhost:7001/api/activity/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activityId: activity.id,
          userId: user.id,
          updateData: editedActivity
        })
      });
      const result = await response.json();
      
      if (result.success) {
        alert('活动更新成功！');
        setIsEditing(false);
        // 调用回调函数通知父组件更新
        if (onActivityUpdated) {
          onActivityUpdated();
        } else {
          // 如果没有回调函数，显示提示
          alert('请刷新页面查看更新后的活动信息');
        }
      } else {
        alert(result.message || '更新活动失败');
      }
    } catch (error) {
      console.error('更新活动出错:', error);
      alert('更新活动时出错，请重试');
    }
  };

  // 检查当前用户是否是活动创建者
  const isCreator = user && activity.user && user.id === activity.user.id;

  if (!activity) {
    return (
      <div className="activity-detail">
        <h2>活动未找到</h2>
        <button onClick={onBackToHome} className="back-btn">返回首页</button>
      </div>
    );
  }

  return (
    <div className="activity-detail">
      <div className="detail-header">
        <button onClick={onBackToHome} className="back-btn">← 返回</button>
        <h1>活动详情</h1>
      </div>

      <div className="detail-content">
        {/* 活动基本信息 */}
        <div className="activity-info">
          <div className="activity-image">
            <img src={isEditing ? editedActivity.photo : activity.photo} alt={isEditing ? editedActivity.name : activity.name} />
          </div>
          <div className="activity-details">
            {isEditing ? (
              /* 编辑模式 */
              <div className="edit-form">
                <h2>编辑活动</h2>
                <div className="form-group">
                  <label>活动名称:</label>
                  <input
                    type="text"
                    value={editedActivity.name}
                    onChange={(e) => setEditedActivity({...editedActivity, name: e.target.value})}
                    placeholder="活动名称"
                  />
                </div>
                <div className="form-group">
                  <label>活动时间:</label>
                  <input
                    type="text"
                    value={editedActivity.time}
                    onChange={(e) => setEditedActivity({...editedActivity, time: e.target.value})}
                    placeholder="活动时间"
                  />
                </div>
                <div className="form-group">
                  <label>活动照片URL:</label>
                  <input
                    type="text"
                    value={editedActivity.photo}
                    onChange={(e) => setEditedActivity({...editedActivity, photo: e.target.value})}
                    placeholder="活动照片URL"
                  />
                </div>
                <div className="form-group">
                  <label>活动状态:</label>
                  <select
                    value={editedActivity.status}
                    onChange={(e) => setEditedActivity({...editedActivity, status: e.target.value})}
                  >
                    <option value="active">进行中</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>活动描述:</label>
                  <textarea
                    value={editedActivity.description}
                    onChange={(e) => setEditedActivity({...editedActivity, description: e.target.value})}
                    placeholder="活动描述"
                    rows="4"
                  />
                </div>
                <div className="edit-buttons">
                  <button onClick={handleSaveEdit} className="save-btn">保存</button>
                  <button onClick={handleCancelEdit} className="cancel-btn">取消</button>
                </div>
              </div>
            ) : (
              /* 查看模式 */
              <div>
                <div className="activity-header">
                  <div className="title-and-status">
                    <h2>{activity.name}</h2>
                    <span className={`activity-status ${activity.status || 'active'}`}>
                      {activity.status === 'completed' ? '已完成' : 
                       activity.status === 'cancelled' ? '已取消' : '进行中'}
                    </span>
                  </div>
                  {isCreator && (
                    <button onClick={handleStartEdit} className="edit-btn">编辑活动</button>
                  )}
                </div>
                <p><strong>时间：</strong>{activity.time}</p>
                <p><strong>描述：</strong>{activity.description}</p>
              </div>
            )}
            
            {/* 参与按钮 */}
            <div className="participation-section">
              {isLoggedIn ? (
                isParticipating ? (
                  <button onClick={handleLeaveActivity} className="leave-btn">
                    退出活动
                  </button>
                ) : (
                  <button onClick={handleJoinActivity} className="join-btn">
                    参与活动
                  </button>
                )
              ) : (
                <p className="login-prompt">请登录后参与活动</p>
              )}
            </div>
          </div>
        </div>

        {/* 参与者列表 */}
        <div className="participants-section">
          <h3>参与者 ({participants.length}人)</h3>
          <div className="participants-list">
            {participants.length > 0 ? (
              participants.map(participant => (
                <div key={participant.id} className="participant-item">
                  {participant.username}
                </div>
              ))
            ) : (
              <p>暂无参与者</p>
            )}
          </div>
        </div>

        {/* 评论区 */}
        <div className="comments-section">
          <h3>评论 ({comments.length}条)</h3>
          
          {/* 添加评论 */}
          {isLoggedIn && (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                rows={3}
              />
              <button type="submit" className="submit-comment-btn">发表评论</button>
            </form>
          )}

          {/* 评论列表 */}
          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <strong>{comment.author.username}</strong>
                    <span className="comment-time">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="comment-content">
                    {comment.content}
                  </div>
                </div>
              ))
            ) : (
              <p>暂无评论</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityDetail;

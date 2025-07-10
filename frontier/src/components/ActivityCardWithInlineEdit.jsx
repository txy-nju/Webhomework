import React from 'react';
import './ActivityCard.css';
import { useActivityEdit } from '../utils/activityEditUtils';

const ActivityCardWithInlineEdit = ({ activity, type, onViewDetail, onLeaveActivity, onActivityUpdated, user }) => {
    // 使用抽取的编辑hook
    const {
        isEditing,
        editedActivity,
        setEditedActivity,
        startEdit,
        cancelEdit,
        saveEdit
    } = useActivityEdit(user, onActivityUpdated);

    const formatDate = (dateString) => {
        if (!dateString) return '未设置';
        
        if (typeof dateString === 'string' && dateString.length < 20) {
            return dateString;
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 处理编辑按钮点击
    const handleEditClick = () => {
        startEdit(activity);
    };

    // 处理保存编辑
    const handleSaveClick = () => {
        saveEdit(activity);
    };

    return (
        <div className={`activity-card ${type}`}>
            <div className="activity-header">
                <h3 className="activity-title">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedActivity.name}
                            onChange={(e) => setEditedActivity({...editedActivity, name: e.target.value})}
                            className="edit-input"
                        />
                    ) : (
                        activity.name
                    )}
                </h3>
                <span className={`activity-status ${activity.status || 'active'}`}>
                    {activity.status === 'completed' ? '已结束' : '进行中'}
                </span>
            </div>
            
            <div className="activity-content">
                <p className="activity-description">
                    {isEditing ? (
                        <textarea
                            value={editedActivity.description}
                            onChange={(e) => setEditedActivity({...editedActivity, description: e.target.value})}
                            className="edit-textarea"
                            rows="3"
                        />
                    ) : (
                        activity.description
                    )}
                </p>
                
                <div className="activity-details">
                    <div className="detail-item">
                        <span className="detail-label">时间：</span>
                        <span className="detail-value">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedActivity.time}
                                    onChange={(e) => setEditedActivity({...editedActivity, time: e.target.value})}
                                    className="edit-input"
                                />
                            ) : (
                                formatDate(activity.startTime || activity.time)
                            )}
                        </span>
                    </div>
                    
                    {activity.location && (
                        <div className="detail-item">
                            <span className="detail-label">地点：</span>
                            <span className="detail-value">{activity.location}</span>
                        </div>
                    )}
                    
                    <div className="detail-item">
                        <span className="detail-label">参与人数：</span>
                        <span className="detail-value">
                            {activity.participantCount || 0}/{activity.maxParticipants || '无限制'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="activity-actions">
                <button className="btn-detail" onClick={() => onViewDetail && onViewDetail(activity)}>
                    查看详情
                </button>
                {type === 'created' && (
                    <>
                        {isEditing ? (
                            <>
                                <button className="btn-save" onClick={handleSaveClick}>
                                    保存
                                </button>
                                <button className="btn-cancel" onClick={cancelEdit}>
                                    取消
                                </button>
                            </>
                        ) : (
                            <button className="btn-edit" onClick={handleEditClick}>
                                编辑活动
                            </button>
                        )}
                    </>
                )}
                {type === 'participated' && (
                    <button className="btn-quit" onClick={() => onLeaveActivity && onLeaveActivity(activity)}>
                        退出活动
                    </button>
                )}
            </div>
        </div>
    );
};

export default ActivityCardWithInlineEdit;

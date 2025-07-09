import './style.css'

const ActivityCard = ({ activity, type }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '未设置';
        
        // 如果是简单的时间字符串，直接返回
        if (typeof dateString === 'string' && dateString.length < 20) {
            return dateString;
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // 如果无法解析，返回原字符串
        
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`activity-card ${type}`}>
            <div className="activity-header">
                <h3 className="activity-title">{activity.name}</h3>
                <span className={`activity-status ${activity.status || 'active'}`}>
                    {activity.status === 'completed' ? '已结束' : '进行中'}
                </span>
            </div>
            
            <div className="activity-content">
                <p className="activity-description">{activity.description}</p>
                
                <div className="activity-details">
                    <div className="detail-item">
                        <span className="detail-label">时间：</span>
                        <span className="detail-value">
                            {formatDate(activity.startTime || activity.time)}
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
                    
                    {type === 'created' && (
                        <div className="detail-item">
                            <span className="detail-label">创建时间：</span>
                            <span className="detail-value">
                                {formatDate(activity.createdAt)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="activity-actions">
                <button className="btn-detail">查看详情</button>
                {type === 'created' && (
                    <button className="btn-edit">编辑活动</button>
                )}
                {type === 'participated' && (
                    <button className="btn-quit">退出活动</button>
                )}
            </div>
        </div>
    );
};

export default ActivityCard;

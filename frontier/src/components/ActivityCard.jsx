function ActivityCard({ activity, type }) {
  return (
    <div className={`activity-card ${type}`}>
      <img src={activity.photo} alt={activity.name} className="activity-image" />
      <div className="activity-info">
        <h3>{activity.name}</h3>
        <p className="activity-time">{activity.time}</p>
        <p className="activity-desc">{activity.description}</p>
        {type === 'created' && (
          <span className="creator-badge">发起者</span>
        )}
      </div>
    </div>
  );
}
export default ActivityCard;
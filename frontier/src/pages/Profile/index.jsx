import './style.css'
import { ShowActivity } from '../Activity'
import ActivityCard from '../../components/ActivityCard'
import ActivityDetail from '../ActivityDetail'
import { useEffect, useState } from 'react'

function ProfilePage({ user, isLoggedIn, onBackHome }){
    const [participatedActivities, setParticipatedActivities] = useState([])
    const [createdActivities, setCreatedActivities] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedActivity, setSelectedActivity] = useState(null)
    const [showActivityDetail, setShowActivityDetail] = useState(false)

    useEffect(() => {
        const fetchParticipatedActivities = async () => {
            try{
                console.log('Fetching participated activities for user:', user.id);
                const response = await fetch(`http://localhost:7001/api/user/participated-activities?userId=${user.id}`);
                const result = await response.json();
                console.log('Participated activities result:', result);
                if(result.success){
                    setParticipatedActivities(result.data);
                    console.log('Set participated activities:', result.data);
                } else {
                    throw new Error(result.message || '获取参与活动失败');
                }
            }catch (error) {
                console.error('获取参与活动失败：',error);
                setError('获取参与活动失败，请稍后重试');
            }
        }

        const fetchCreatedActivities = async () => {
            try {
                const response = await fetch(`http://localhost:7001/api/user/created-activities?userId=${user.id}`);
                const result = await response.json();
                console.log('Created activities result:', result);
                if (result.success) {
                    setCreatedActivities(result.data);
                    console.log('Set created activities:', result.data);
                } else {
                    throw new Error(result.message || '获取创建活动失败');
                }
            } catch (error) {
                console.error('获取创建活动失败:', error);
                setError('获取创建活动失败，请稍后重试');
            }
        };

        const fetchAllActivities = async () => {
            setLoading(true);
            setError('');
            try {
                await Promise.all([
                    fetchParticipatedActivities(),
                    fetchCreatedActivities()
                ]);
            } finally {
                setLoading(false);
            }
        };

        if(isLoggedIn && user){
            fetchAllActivities();
        }
    },[user,isLoggedIn]);

    // 处理查看详情
    const handleViewDetail = (activity) => {
        setSelectedActivity(activity);
        setShowActivityDetail(true);
    };

    // 处理退出活动
    const handleLeaveActivity = async (activity) => {
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
                // 刷新参与活动列表
                const response = await fetch(`http://localhost:7001/api/user/participated-activities?userId=${user.id}`);
                const refreshResult = await response.json();
                if (refreshResult.success) {
                    setParticipatedActivities(refreshResult.data);
                }
            } else {
                alert(result.message || '退出活动失败');
            }
        } catch (error) {
            console.error('退出活动出错:', error);
            alert('退出活动时出错，请重试');
        }
    };

    // 关闭活动详情
    const handleCloseDetail = () => {
        setShowActivityDetail(false);
        setSelectedActivity(null);
    };

    return (
        <div className='profile-page'>
            {showActivityDetail && selectedActivity ? (
                <ActivityDetail
                    activity={selectedActivity}
                    onBackToHome={handleCloseDetail}
                    user={user}
                    isLoggedIn={isLoggedIn}
                />
            ) : (
                <>
                    <div className='profile-header'>
                        <button onClick={onBackHome}>返回首页</button>
                        <h1>个人中心</h1>
                    </div>
                    <div className='activities-container'>
                        {loading ? (
                            <div className='loading-container'>
                                <div className='loading-spinner'></div>
                                <p>加载中...</p>
                            </div>
                        ) : error ? (
                            <div className='error-container'>
                                <p className='error-message'>{error}</p>
                                <button className='retry-button' onClick={() => window.location.reload()}>
                                    重试
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className='activity-section'>
                                    <h2>我参加的活动</h2>
                                    <div className='activity-list'>
                                        {participatedActivities.length > 0 ? (
                                            participatedActivities.map(activity => {
                                                console.log('Rendering participated activity:', activity);
                                                return (
                                                    <ActivityCard 
                                                        key={activity.id} 
                                                        activity={activity} 
                                                        type="participated"
                                                        onViewDetail={handleViewDetail}
                                                        onLeaveActivity={handleLeaveActivity}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <p className='no-activities'>暂无参与的活动</p>
                                        )}
                                    </div>
                                </div>
                                <div className='activity-section'>
                                    <h2>我发起的活动</h2>
                                    <div className='activity-list'>
                                        {createdActivities.length > 0 ? (
                                            createdActivities.map(activity => {
                                                console.log('Rendering created activity:', activity);
                                                return (
                                                    <ActivityCard 
                                                        key={activity.id} 
                                                        activity={activity} 
                                                        type="created"
                                                        onViewDetail={handleViewDetail}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <p className='no-activities'>暂无发起的活动</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
export default ProfilePage;
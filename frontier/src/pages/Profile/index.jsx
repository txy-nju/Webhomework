import './style.css'
import { ShowActivity } from '../Activity'
import ActivityCard from '../../components/ActivityCard'
import ActivityDetail from '../ActivityDetail'
import FollowList from './FollowList'
import UserProfile from '../UserProfile'
import { useEffect, useState } from 'react'

function ProfilePage({ user, isLoggedIn, onBackHome }){
    const [participatedActivities, setParticipatedActivities] = useState([])
    const [createdActivities, setCreatedActivities] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedActivity, setSelectedActivity] = useState(null)
    const [showActivityDetail, setShowActivityDetail] = useState(false)
    const [editMode, setEditMode] = useState(false)
    // 新增用户资料查看相关状态
    const [showUserProfile, setShowUserProfile] = useState(false)
    const [targetUser, setTargetUser] = useState(null)

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
        setEditMode(false);
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
    // 处理完成活动状态
    const handleActivityCompletion = async (activity) => {
        try {
            const response = await fetch('http://localhost:7001/api/activity/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    activityId: activity.id,
                    userId: user.id,
                    status: 'completed'
                })
            });
            const result = await response.json();
            
            if (result.success) {
                alert('活动已标记为完成');
                // 刷新创建的活动列表
                const response = await fetch(`http://localhost:7001/api/user/created-activities?userId=${user.id}`);
                const refreshResult = await response.json();
                if (refreshResult.success) {
                    setCreatedActivities(refreshResult.data);
                }
            } else {
                alert(result.message || '更新活动状态失败');
            }
        } catch (error) {
            console.error('更新活动状态出错:', error);
            alert('更新活动状态时出错，请重试');
        }
    };

    // 关闭活动详情
    const handleCloseDetail = () => {
        setShowActivityDetail(false);
        setSelectedActivity(null);
        setEditMode(false);
        // 如果有targetUser，说明是从UserProfile页面来的，返回到UserProfile
        if (targetUser) {
            setShowUserProfile(true);
        }
    };

    // 处理编辑活动
    const handleEditActivity = (activity) => {
        // 设置选中的活动并切换到ActivityDetail页面，进入编辑模式
        setSelectedActivity(activity);
        setEditMode(true);
        setShowActivityDetail(true);
    };

    // 处理查看用户资料
    const handleViewUserProfile = (targetUserInfo) => {
        setTargetUser(targetUserInfo);
        setShowUserProfile(true);
    };

    // 返回到个人中心
    const handleBackToProfile = () => {
        setShowUserProfile(false);
        setTargetUser(null);
    };

    // 查看活动详情（从用户资料页面）
    const handleViewActivityFromProfile = (activity) => {
        setSelectedActivity(activity);
        setShowActivityDetail(true);
        setEditMode(false);
        // 关闭用户资料页面
        setShowUserProfile(false);
    };

    return (
        <div className='profile-page'>
            {showUserProfile && targetUser ? (
                <UserProfile
                    targetUser={targetUser}
                    onBackToProfile={handleBackToProfile}
                    onViewActivity={handleViewActivityFromProfile}
                    currentUser={user}
                    isLoggedIn={isLoggedIn}
                />
            ) : showActivityDetail && selectedActivity ? (
                <ActivityDetail
                    activity={selectedActivity}
                    onBackToHome={handleCloseDetail}
                    user={user}
                    isLoggedIn={isLoggedIn}
                    startInEditMode={editMode}
                    onActivityUpdated={() => {
                        // 当活动更新后，刷新创建的活动列表
                        const fetchCreatedActivities = async () => {
                            try {
                                const response = await fetch(`http://localhost:7001/api/user/created-activities?userId=${user.id}`);
                                const result = await response.json();
                                if (result.success) {
                                    setCreatedActivities(result.data);
                                }
                            } catch (error) {
                                console.error('刷新创建活动失败:', error);
                            }
                        };
                        fetchCreatedActivities();
                        handleCloseDetail();
                    }}
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
                                                        onEditActivity={handleEditActivity}
                                                        onCompleteActivity={handleActivityCompletion}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <p className='no-activities'>暂无发起的活动</p>
                                        )}
                                    </div>
                                </div>
                                <div className='follow-section'>
                                    <div className='follow-lists'>
                                        <FollowList 
                                            user={user} 
                                            type="following" 
                                            onViewUserProfile={handleViewUserProfile}
                                        />
                                        <FollowList 
                                            user={user} 
                                            type="followers" 
                                            onViewUserProfile={handleViewUserProfile}
                                        />
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
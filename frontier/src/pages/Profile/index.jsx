import './style.css'
import { ShowActivity } from '../Activity'
import ActivityCard from '../../components/ActivityCard'
import { useEffect, useState } from 'react'

function ProfilePage({ user, isLoggedIn, onBackHome }){
    const [participatedActivities, setParticipatedActivities] = useState([])
    const [createdActivities, setCreatedActivities] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchParticipatedActivities = async () => {
            try{
                console.log('Fetching participated activities for user:', user.id);
                const response = await fetch(`http://localhost:7001/api/user/participated-activities?userId=${user.id}`);
                const result = await response.json();
                console.log('Participated activities result:', result);
                if(result.success){
                    setParticipatedActivities(result.data);
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
                if (result.success) {
                    setCreatedActivities(result.data);
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

    return (
        <div className='profile-page'>
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
                                    participatedActivities.map(activity => (
                                        <ActivityCard key={activity.id} activity={activity} type="participated" />
                                    ))
                                ) : (
                                    <p className='no-activities'>暂无参与的活动</p>
                                )}
                            </div>
                        </div>
                        <div className='activity-section'>
                            <h2>我发起的活动</h2>
                            <div className='activity-list'>
                                {createdActivities.length > 0 ? (
                                    createdActivities.map(activity => (
                                        <ActivityCard key={activity.id} activity={activity} type="created" />
                                    ))
                                ) : (
                                    <p className='no-activities'>暂无发起的活动</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

        </div>

    )
}
export default ProfilePage;
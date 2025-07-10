import { useState } from 'react';

// 活动编辑相关的工具函数

/**
 * 保存活动编辑
 * @param {Object} params - 参数对象
 * @param {number} params.activityId - 活动ID
 * @param {number} params.userId - 用户ID
 * @param {Object} params.updateData - 更新数据
 * @returns {Promise<Object>} - 返回API调用结果
 */
export const saveActivityEdit = async ({ activityId, userId, updateData }) => {
  try {
    const response = await fetch('http://localhost:7001/api/activity/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activityId,
        userId,
        updateData
      })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('更新活动出错:', error);
    throw error;
  }
};

/**
 * 处理活动编辑的完整流程
 * @param {Object} params - 参数对象
 * @param {Object} params.activity - 当前活动对象
 * @param {Object} params.user - 用户对象
 * @param {Object} params.editedData - 编辑后的数据
 * @param {Function} params.onSuccess - 成功回调
 * @param {Function} params.onError - 错误回调
 */
export const handleActivityEdit = async ({ 
  activity, 
  user, 
  editedData, 
  onSuccess, 
  onError 
}) => {
  if (!user) {
    alert('请先登录');
    return;
  }

  try {
    const result = await saveActivityEdit({
      activityId: activity.id,
      userId: user.id,
      updateData: editedData
    });

    if (result.success) {
      alert('活动更新成功！');
      if (onSuccess) {
        onSuccess(result);
      }
    } else {
      alert(result.message || '更新活动失败');
      if (onError) {
        onError(result);
      }
    }
  } catch (error) {
    alert('更新活动时出错，请重试');
    if (onError) {
      onError(error);
    }
  }
};

/**
 * 验证活动编辑数据
 * @param {Object} editedData - 编辑的数据
 * @returns {Object} - 验证结果 { isValid: boolean, errors: string[] }
 */
export const validateActivityData = (editedData) => {
  const errors = [];
  
  if (!editedData.name || editedData.name.trim() === '') {
    errors.push('活动名称不能为空');
  }
  
  if (!editedData.time || editedData.time.trim() === '') {
    errors.push('活动时间不能为空');
  }
  
  if (!editedData.description || editedData.description.trim() === '') {
    errors.push('活动描述不能为空');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 创建编辑活动的hook
 * @param {Object} user - 用户对象
 * @param {Function} onActivityUpdated - 活动更新回调
 * @returns {Object} - 返回编辑相关的状态和方法
 */
export const useActivityEdit = (user, onActivityUpdated) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivity, setEditedActivity] = useState({
    name: '',
    time: '',
    description: '',
    photo: ''
  });

  const startEdit = (activity) => {
    setEditedActivity({
      name: activity.name,
      time: activity.time,
      description: activity.description,
      photo: activity.photo
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedActivity({
      name: '',
      time: '',
      description: '',
      photo: ''
    });
  };

  const saveEdit = async (activity) => {
    const validation = validateActivityData(editedActivity);
    if (!validation.isValid) {
      alert('请填写完整信息：\n' + validation.errors.join('\n'));
      return;
    }

    await handleActivityEdit({
      activity,
      user,
      editedData: editedActivity,
      onSuccess: () => {
        setIsEditing(false);
        if (onActivityUpdated) {
          onActivityUpdated();
        }
      },
      onError: (error) => {
        console.error('编辑失败:', error);
      }
    });
  };

  return {
    isEditing,
    editedActivity,
    setEditedActivity,
    startEdit,
    cancelEdit,
    saveEdit
  };
};

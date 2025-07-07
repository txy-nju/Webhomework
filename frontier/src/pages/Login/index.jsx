import React from 'react'
import './style.css'

// 登录页面组件
function LoginPage({ onBackToHome, onLoginSuccess }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = {
      username: formData.get('username'),
      password: formData.get('password')
    };
    
    try {
      // 这里可以添加登录请求逻辑
      const res = await fetch('http://localhost:7001/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      const result = await res.json();
      
      if (result.success) {
        alert('登录成功');
        // 登录成功后返回首页
        onLoginSuccess(result.data); // 调用回调函数传递用户数据
      } else {
        alert('登录失败：' + (result.message || '用户名或密码错误'));
      }
    } catch (error) {
      console.error('登录时出错:', error);
      alert('登录时出错，请重试');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>用户登录</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input 
              type="text" 
              name="username" 
              placeholder="用户名" 
              required 
              className="login-input"
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              name="password" 
              placeholder="密码" 
              required 
              className="login-input"
            />
          </div>
          <button type="submit" className="login-submit-btn">登录</button>
          <button type="button" className="back-btn" onClick={onBackToHome}>
            返回首页
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

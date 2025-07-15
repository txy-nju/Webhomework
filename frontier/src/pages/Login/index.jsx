import React, { useState } from 'react'
import './style.css'
import RegisterForm from './RegisterForm'

// 登录页面组件
function LoginPage({ onBackToHome, onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true); // true: 登录模式, false: 注册模式
  
  // 切换到注册模式
  const switchToRegister = () => {
    setIsLoginMode(false);
  };
  
  // 切换到登录模式
  const switchToLogin = () => {
    setIsLoginMode(true);
  };
  
  // 处理注册成功
  const handleRegisterSuccess = () => {
    // 注册成功后切换到登录模式
    setIsLoginMode(true);
  };
  
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
        // 将用户信息存储到localStorage以实现持久化登录
        const userDataWithToken = {
          ...result.data,
          loginTime: new Date().getTime() // 记录登录时间
        };
        localStorage.setItem('userInfo', JSON.stringify(userDataWithToken));
        
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
        {isLoginMode ? (
          /* 登录表单 */
          <div className="login-form">
            <h2>用户登录</h2>
            <form onSubmit={handleSubmit}>
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
              <button type="button" className="switch-btn" onClick={switchToRegister}>
                没有账号？点击注册
              </button>
              <button type="button" className="back-btn" onClick={onBackToHome}>
                返回首页
              </button>
            </form>
          </div>
        ) : (
          /* 注册表单 */
          <div>
            <RegisterForm 
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={switchToLogin}
            />
            <button type="button" className="back-btn standalone" onClick={onBackToHome}>
              返回首页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;

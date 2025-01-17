<script setup>
  const userData = JSON.parse(localStorage.getItem('userData'));
  var userInfo = userData.data.userInfo;
  var name = userInfo.name;
  var account = userInfo.account;
  var imgURL = userInfo.avatar;
  
  const toPerson = () => {
    window.open('person.html','_self');
  }
  //切换账号
  const changeAccount = () => {
    localStorage.removeItem('userData');
    window.close();
    window.open('load.html');
  };

  //退出
  const exit = () => {
    localStorage.removeItem('userData');
    window.close();
    window.open('index.html');
  };
</script>

<template>
  <div class="userinfo">
    <div class="user-header">
      <img :src="imgURL" alt="用户头像" class="avatar">
      <div class="user-basic">
        <h3>{{ name }}</h3>
        <span class="account">@{{ account }}</span>
      </div>
    </div>
    
    <div class="user-actions">
      <button @click="toPerson" class="action-button">
        <i class="icon">👤</i>
        <span>查看个人资料</span>
      </button>
      <button @click="changeAccount" class="action-button">
        <i class="icon">🔄</i>
        <span>切换账号</span>
      </button>
      <button @click="exit" class="action-button exit">
        <i class="icon">🚪</i>
        <span>退出</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.userinfo {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 280px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-header {
  padding: 24px;
  background: linear-gradient(135deg, #4095E5, #2d7bc0);
  color: white;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 16px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.user-basic h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.account {
  font-size: 14px;
  opacity: 0.9;
}

.user-actions {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: #f8f9fa;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.action-button.exit {
  color: #dc3545;
}

.action-button.exit:hover {
  background: rgba(220, 53, 69, 0.1);
}

.icon {
  font-size: 18px;
  opacity: 0.8;
}

/* 添加箭头指示器 */
.userinfo::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 24px;
  width: 12px;
  height: 12px;
  background: white;
  transform: rotate(45deg);
  box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.05);
}

/* 添加卡片悬浮效果 */
.userinfo:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

/* 添加一个透明的连接区域，防止鼠标移动时卡片消失 */
.userinfo::after {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background: transparent;
}
</style>
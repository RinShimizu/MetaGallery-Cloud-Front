<script setup>
  import { onMounted, nextTick } from 'vue';

  let h_home = 0;
  let h_case = 0;
  onMounted(async () => {
    await nextTick(); // 确保 DOM 完全更新
    h_home = document.getElementById("page1")?.offsetHeight;
    h_case = document.getElementById("page2")?.offsetHeight;
  });

  const Reg = () => {
    window.open('register.html');//在当前页面直接打开，加_self
  }
  const Log = () => {
    window.open('load.html');
  }
  const toHome = () => {
    window.scrollTo({top:0,behavior:'smooth'})
  }
  const toCase = () => {
    window.scrollTo({top:h_home,behavior:'smooth'})
  }
  const toCont = () => {
    window.scrollTo({top:h_home + h_case,behavior:'smooth'})
  }
</script>

<template>
  <div class="Navi">
    <p class="Logo">MetaGallery Cloud</p>
    <div class="link">
      <button @click="toHome">首页</button>
      <button @click="toCase">案例展示</button>
      <button @click="toCont">联系我们</button>
    </div>
    <div class="user">
      <button id="btn1" @click="Reg">注册</button>
      <button id="btn2" @click="Log">登录</button>
    </div>
  </div>
</template>

<style scoped>
.Navi {
  height: 80px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeIn 0.5s ease-out;
}

.Logo {
  color: #4095E5;
  font-family: 微软雅黑;
  font-size: 28px;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 60px;
}

.link {
  width: 40%;
  display: flex;
  margin-left: 60px;
}

.link button {
  height: 50px;
  width: 120px;
  margin: auto;
  font-size: 22px;
  background-color: transparent;
  color: #4095E5;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.link button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: #4095E5;
  transition: width 0.3s ease;
}

.link button:hover::after {
  width: 80%;
}

.link button:hover {
  transform: translateY(-2px);
  background-color: rgba(64, 149, 229, 0.05);
}

.user {
  display: flex;
  gap: 15px;
  margin-right: 60px;
}

#btn1, #btn2 {
  height: 40px;
  width: 90px;
  font-size: 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

#btn1 {
  background-color: transparent;
  color: #4095E5;
  border: 2px solid #4095E5;
}

#btn2 {
  background-color: #4095E5;
  color: white;
  border: none;
}

#btn1:hover {
  background-color: rgba(64, 149, 229, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 149, 229, 0.2);
}

#btn2:hover {
  background-color: #3084d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 149, 229, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 添加响应式设计 */
@media screen and (max-width: 768px) {
  .Navi {
    padding: 0 20px;
  }
  
  .Logo {
    font-size: 24px;
  }
  
  .link {
    margin-left: 30px;
    gap: 10px;
  }
  
  .link button {
    width: 80px;
    font-size: 14px;
  }
  
  .user {
    margin-left: 20px;
    gap: 10px;
  }
  
  #btn1, #btn2 {
    width: 70px;
    font-size: 14px;
  }
}
</style>
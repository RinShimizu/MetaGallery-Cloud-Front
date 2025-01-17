<script setup>
import { onMounted, nextTick } from 'vue';

let h_home = 0;
let h_case = 0;
onMounted(async () => {
  await nextTick();
  h_home = document.getElementById("page1")?.offsetHeight;
  h_case = document.getElementById("page2")?.offsetHeight;
});

const Reg = () => {
  window.open('register.html');
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
  <!-- 导航栏 -->
  <div class="nav-bar">
    <p class="nav-logo">MetaGallery Cloud</p>
    <div class="nav-link">
      <button @click="toHome">首页</button>
      <button @click="toCase">案例展示</button>
      <button @click="toCont">联系我们</button>
    </div>
    <div class="nav-user">
      <button class="btn-register" @click="Reg">注册</button>
      <button class="btn-login" @click="Log">登录</button>
    </div>
  </div>

  <!-- 首页部分 -->
  <div class="home-section" id="page1">
    <h1>欢迎来到 MetaGallery Cloud</h1>
    <p class="home-intro">一个集<strong>文件管理</strong>、<strong>共享</strong>和<strong>去中心化存储</strong>于一体的云平台</p>
    <div class="feature-grid">
      <div class="feature-item feature-1">
        <h2>用户管理</h2>
        <p>轻松注册、登录，安全管理个人信息。通过简单的界面，用户可以更新头像、用户名和签名，确保你的个人空间与众不同。</p>
      </div>
      <div class="feature-item feature-2">
        <h2>文件管理</h2>
        <p>上传、管理你的文件从未如此便捷！使用直观的工具创建文件夹，轻松重命名、查询或下载文件。更智能的文件回收机制让你随时找回误删的文件。</p>
      </div>
      <div class="feature-item feature-3">
        <h2>社区画廊</h2>
        <p>分享你的创作，探索他人的精彩作品！社区画廊是一个开放的共享平台，支持图片、文档等多种格式的在线预览，让文件分享更简单、更互动。</p>
      </div>
      <div class="feature-item feature-4">
        <h2>分布式存储（IPFS）</h2>
        <p>借助IPFS和Pinata的分布式存储技术，我们让文件存储变得更加安全、高效。全球分布式存储，随时随地访问，体验数据存储的新高度。</p>
      </div>
    </div>
  </div>

  <!-- 案例展示部分 -->
  <div class="case-section" id="page2">
    <h2>案例展示</h2>
    <div class="case-slider">
      <img src="./assets/case1.png" alt="case1">
      <img src="./assets/case2.png" alt="case2">
      <img src="./assets/case3.png" alt="case3">
      <img src="./assets/case4.png" alt="case4">
      <img src="./assets/case1.png" alt="case5">
    </div>
  </div>

  <!-- 联系我们部分 -->
  <div class="contact-section">
    <div class="social-links">
      <button><img src="./assets/QQ.svg" alt="qq"></button>
      <button><img src="./assets/新浪微博.svg" alt="weibo"></button>
      <button><img src="./assets/微信.svg" alt="wechat"></button>
      <button><img src="./assets/邮件.svg" alt="email"></button>
    </div>
    <span class="copyright">©2024.only我们小组版权所有</span>
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f6f8fa;
  overflow-x: hidden;
}

/* 首页部分样式优化 */
.home-section {
  position: relative;
  min-height: 100vh;
  padding: 120px 0 80px;
  background: #f6f8fa;
  overflow: hidden;
  isolation: isolate;
}

.home-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(64, 149, 229, 0.15) 100%, transparent 60%);
  transform: rotate(-45deg);
  z-index: -1;
  animation: pulse 8s ease-in-out infinite;
}

.home-section h1,
.home-intro,
.feature-grid {
  position: relative;
  z-index: 1;
}

.home-section h1 {
  font-size: 64px;
  font-weight: 800;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #2c3e50, #4095E5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 1s ease-out;
}

.home-intro {
  font-size: 32px;
  text-align: center;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  animation: fadeInUp 1s ease-out 0.3s backwards;
  white-space:nowrap;
}

.home-intro strong {
  color: #4095E5;
  font-weight: 600;
}

/* 特性网格布局优化 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
  max-width: 1400px;
  margin: 80px auto 0;
  padding: 0 40px;
  position: relative;
  z-index: 1;
}

.feature-item {
  position: relative;
  padding: 40px 30px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 380px;
}

/* 特性图标优化 */
.feature-item::before {
  content: '';
  width: 70px;
  height: 70px;
  margin-bottom: 25px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.9;
  transition: all 0.5s ease;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}


/* 特性卡片装饰 */
.feature-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(64, 149, 229, 0.1), transparent 80%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.feature-item:hover {
  transform: translateY(-15px);
  box-shadow: 0 20px 40px rgba(64, 149, 229, 0.15);
}

.feature-item:hover::before {
  transform: scale(1.1) translateY(-5px);
}

.feature-item:hover::after {
  opacity: 1;
}

.feature-item h2 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 25px;
  text-align: center;
  position: relative;
}

.feature-item h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: linear-gradient(to right, #4095E5, #73b4ff);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.feature-item:hover h2::after {
  width: 80px;
}

.feature-item p {
  font-size: 16px;
  line-height: 1.8;
  color: #666;
  text-align: center;
  margin: 0;
  transition: all 0.3s ease;
}

/* 添加特性卡片动画 */
.feature-item {
  animation: fadeInUp 0.8s ease-out backwards;
}

.feature-1 { animation-delay: 0.4s; }
.feature-1::before{ background-image: url("assets/个人中心-我的.svg"); }
.feature-2 { animation-delay: 0.6s; }
.feature-2::before{ background-image: url("assets/文件.svg"); }
.feature-3 { animation-delay: 0.8s; }
.feature-3::before{ background-image: url("assets/图片.svg"); }
.feature-4 { animation-delay: 1.0s; }
.feature-4::before{ background-image: url("assets/ipfs.svg"); }

/* 新增动画关键帧 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式优化 */
@media screen and (max-width: 1200px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 30px;
  }
}

@media screen and (max-width: 768px) {
  .home-section {
    padding: 100px 0 60px;
  }

  .home-section h1 {
    font-size: 40px;
  }

  .home-intro {
    font-size: 24px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 0 20px;
  }

  .feature-item {
    padding: 30px 20px;
    min-height: 320px;
  }
}

/* 导航栏样式 */
.nav-bar {
  height: 80px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeIn 0.5s ease-out;
}

.nav-logo {
  color: #4095E5;
  font-family: 微软雅黑;
  font-size: 28px;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 60px;
}

.nav-link {
  width: 40%;
  display: flex;
  margin-left: 60px;
}

.nav-link button {
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

.nav-link button::after {
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

.nav-link button:hover::after {
  width: 80%;
}

.nav-link button:hover {
  transform: translateY(-2px);
  background-color: rgba(64, 149, 229, 0.05);
}

.nav-user {
  display: flex;
  gap: 15px;
  margin-right: 60px;
}

.btn-register, .btn-login {
  height: 40px;
  width: 90px;
  font-size: 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-register {
  background-color: transparent;
  color: #4095E5;
  border: 2px solid #4095E5;
}

.btn-login {
  background-color: #4095E5;
  color: white;
  border: none;
}

.btn-register:hover {
  background-color: rgba(64, 149, 229, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 149, 229, 0.2);
}

.btn-login:hover {
  background-color: #3084d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 149, 229, 0.2);
}

/* 案例展示部分样式 */
.case-section {
  position: relative;
  min-height: 100vh;
  width: 100%;
  padding: 100px 0;
  background: #f6f8fa;
  overflow: hidden;
}



.case-section h2 {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 60px;
  color: #2c3e50;
  position: relative;
  z-index: 1;
  animation: fadeInUp 1s ease-out;
}

.case-section h2::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #4095E5, #73b4ff);
  border-radius: 2px;
}

.case-slider {
  position: relative;
  width: 60%;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  z-index: 1;
}

.case-slider img {
  width: 100%;
  height: auto;
  flex-shrink: 0;
  animation: slideImages 20s linear infinite;
}

@keyframes slideImages {
  0% { transform: translateX(0); }
  22% { transform: translateX(0); }
  25% { transform: translateX(-100%); }
  47% { transform: translateX(-100%); }
  50% { transform: translateX(-200%); }
  72% { transform: translateX(-200%); }
  75% { transform: translateX(-300%); }
  97% { transform: translateX(-300%); }
  100% { transform: translateX(-400%); }
}

/* 联系我们部分样式 */
.contact-section {
  position: relative;
  width: 100%;
  padding: 20px 0;
  background: #f6f8fa;
  text-align: center;
  overflow: hidden;
}

.social-links {
  position: relative;
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
  z-index: 1;
  animation: fadeInUp 1s ease-out;
}

.social-links button {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.social-links button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4095E5, #73b4ff);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.social-links button:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(64, 149, 229, 0.25);
}

.social-links button:hover::before {
  opacity: 0.1;
}

.social-links button img {
  width: 28px;
  height: 28px;
  transition: all 0.4s ease;
  filter: brightness(0.8);
}

.social-links button:hover img {
  transform: scale(1.15);
  filter: brightness(1);
}

.copyright {
  position: relative;
  display: inline-block;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 1s ease-out 0.3s backwards;
  z-index: 1;
}

/* 修改动画关键帧 */
@keyframes slideImages {
  0% { transform: translateX(0); }
  20% { transform: translateX(0); }
  25% { transform: translateX(-100%); }
  45% { transform: translateX(-100%); }
  50% { transform: translateX(-200%); }
  70% { transform: translateX(-200%); }
  75% { transform: translateX(-300%); }
  95% { transform: translateX(-300%); }
  100% { transform: translateX(-400%); }
}

/* 动画 */
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

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-8px) rotate(0.5deg);
  }
  75% {
    transform: translateY(8px) rotate(-0.5deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

/* 添加呼吸动画效果 */
@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: rotate(-45deg) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: rotate(-45deg) scale(1.05);
  }
}
</style>
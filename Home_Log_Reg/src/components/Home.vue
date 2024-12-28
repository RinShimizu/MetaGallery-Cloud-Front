<script setup>

</script>

<template>
  <div class="Home" id="page1">
    <h1>欢迎来到 MetaGallery Cloud</h1>
    <p id="p1">一个集<strong>文件管理</strong>、<strong>共享</strong>和<strong>去中心化存储</strong>于一体的云平台</p>
    <div class="induct">
      <div class="in1">
        <h2>用户管理</h2>
        <p id="p2">轻松注册、登录，安全管理个人信息。通过简单的界面，用户可以更新头像、用户名和签名，确保你的个人空间与众不同。</p>
      </div>
      <div class="in2">
        <h2>文件管理</h2>
        <p id="p3">上传、管理你的文件从未如此便捷！使用直观的工具创建文件夹，轻松重命名、查询或下载文件。更智能的文件回收机制让你随时找回误删的文件。</p>
      </div>
      <div class="in3">
        <h2>社区画廊</h2>
        <p id="p4">分享你的创作，探索他人的精彩作品！社区画廊是一个开放的共享平台，支持图片、文档等多种格式的在线预览，让文件分享更简单、更互动。</p>
      </div>
      <div class="in4">
        <h2>分布式存储（IPFS）</h2>
        <p id="p5">借助IPFS和Pinata的分布式存储技术，我们让文件存储变得更加安全、高效。全球分布式存储，随时随地访问，体验数据存储的新高度。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.Home {
  position: absolute;
  height: 1000px;
  width: 100%;
  left: 0;
  z-index: -1;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

h1 {
  margin-top: 180px;
  font-size: 60px;
  text-align: center;
  color: #2c3e50;
  animation: fadeIn 1s ease-out;
}

#p1 {
  font-size: 40px;
  text-align: center;
  padding-top: 10px;
  font-family: 幼圆;
  color: #666;
  animation: fadeIn 1s ease-out 0.3s backwards;
}

.induct {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 90%;
  max-width: 1400px;
  margin: 80px auto 0;
  gap: 40px;
}

.in1, .in2, .in3, .in4 {
  position: relative;
  width: calc(25% - 30px);
  min-width: 280px;
  height: 320px;
  padding: 30px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.5s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 添加图标 */
.in1::before, .in2::before, .in3::before, .in4::before {
  content: '';
  width: 60px;
  height: 60px;
  margin-bottom: 20px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.8;
}

.in1::before { background-image: url('../assets/个人中心-我的.svg'); }
.in2::before { background-image: url('../assets/文件夹.svg'); }
.in3::before { background-image: url('../assets/图片.svg'); }
.in4::before { background-image: url('../assets/云存储.svg'); }

/* 添加装饰背景 */
.in1::after, .in2::after, .in3::after, .in4::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(64, 149, 229, 0.1), transparent 60%);
  z-index: -1;
  border-radius: 30px;
}

.in1:hover, .in2:hover, .in3:hover, .in4:hover {
  transform: translateY(-15px) scale(1.02);
  box-shadow: 0 20px 40px rgba(64, 149, 229, 0.15);
}

h2 {
  margin: 0 0 20px 0;
  text-align: center;
  color: #2c3e50;
  font-size: 26px;
  font-weight: 600;
  position: relative;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #4095E5;
  border-radius: 2px;
}

#p2, #p3, #p4, #p5 {
  font-family: 幼圆;
  font-size: 16px;
  color: #666;
  line-height: 1.8;
  text-align: center;
  margin: 0;
  padding: 0 10px;
}

/* 修改浮动动画 */
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

.in1 { animation: float 6s ease-in-out infinite; }
.in2 { animation: float 6s ease-in-out infinite 1.5s; }
.in3 { animation: float 6s ease-in-out infinite 3s; }
.in4 { animation: float 6s ease-in-out infinite 4.5s; }

/* 添加响应式设计 */
@media screen and (max-width: 1200px) {
  .induct {
    width: 95%;
    gap: 30px;
  }
  
  .in1, .in2, .in3, .in4 {
    width: calc(50% - 30px);
  }
}

@media screen and (max-width: 768px) {
  .induct {
    width: 100%;
    gap: 20px;
  }
  
  .in1, .in2, .in3, .in4 {
    width: calc(100% - 40px);
    height: 300px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
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
  .Home{
    position: absolute;
    height: 800px;
    width: 100%;
    margin-top: 85px;
    left: 0;
    //background: linear-gradient(0deg,#4095E533,white,#4095E533);
    //animation: backcolor 10s ease infinite alternate;
    //background-size: 200% 200%;
    z-index: -1;
  }
  h1{
    position: relative;
    top: 50px;
    font-size: 60px;
    text-align: center;
  }
  #p1{
    font-size: 40px;
    text-align: center;
    padding-top: 30px;
    font-family: 幼圆;
    opacity: 70%;
  }
  .induct{
    display: inline-flex;
    position: relative;
    top: 50px;
    width: 100%;
    height: 400px;
  }
  .in1{
    position: relative;
    margin: auto;
    aspect-ratio: 1 / 1;
    width: 20%;
    padding: 0 10px;
    //background: radial-gradient(circle at 50% 50%, #4095E54c,#4095E519);
    border-radius: 50px; /* 使 div 呈圆形 */
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
    animation: position 8s linear infinite;
  }
  .in1::after{
    content: '';
    position: absolute;
    background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.5), transparent);
    border-radius: 50%;
    animation: bubble 5s linear alternate infinite;
  }
  .in2{
    position: relative;
    margin: auto;
    aspect-ratio: 1 / 1;
    width: 20%;
    padding: 0 10px;
    border-radius: 50px; /* 使 div 呈圆形 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
    animation: position 8s linear infinite;
    animation-delay: 0.5s;
  }
  .in2::after{
    content: '';
    position: absolute;
    background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.5), transparent);
    border-radius: 50%;
    animation: bubble 5s linear alternate infinite;
  }
  .in3{
    position: relative;
    margin: auto;
    aspect-ratio: 1 / 1;
    width: 20%;
    padding: 0 10px;
    border-radius: 50px; /* 使 div 呈圆形 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
    animation: position 8s linear infinite;
    animation-delay: 0.8s;
  }
  .in3::after{
    content: '';
    position: absolute;
    background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.5), transparent);
    border-radius: 50%;
    animation: bubble 5s linear alternate infinite;
  }
  .in4{
    position: relative;
    margin: auto;
    aspect-ratio: 1 / 1;
    width: 20%;
    padding: 0 10px;
    border-radius: 50px; /* 使 div 呈圆形 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
    animation: position 8s linear infinite;
    animation-delay: 1.3s;
  }
  .in4::after{
    content: '';
    position: absolute;
    background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.5), transparent);
    border-radius: 50%;
    animation: bubble 5s linear alternate infinite;
  }
  .in1:hover,.in2:hover,.in3:hover,.in4:hover{
    animation-play-state: paused;
    padding: 15px 25px;
    width: 22%;
    font-size: 26px;
    transition-duration: 0.2s;
  }
  h2{
    margin: 17% auto 0 auto;
    text-align: center;
    vertical-align: middle;
  }
  #p2,#p3,#p4,#p5{
    font-family: 幼圆;
    font-size: 25px;
  }


  @keyframes backcolor {
    0% {
      background-position: 0 100%;
    }
    50% {
      background-position: 0 50%;
    }
    100% {
      background-position: 0 0;
    }
  }
  @keyframes bubble {
    0%{
      top: 0;
      left: 0;
      width: 30%;
      height: 30%;
    }
    50%{
      top: 35%;
      left: 50%;
      width: 40%;
      height: 40%;
    }
    100%{
      top: 75%;
      left: 25%;
      width: 20%;
      height: 20%;
    }
  }
  @keyframes position {
    0%{
      transform: translateY(0);
    }
    25%{
      transform: translateY(10px);
    }
    50%{
      transform: translateY(-10px);
    }
    75%{
      transform: translateY(10px);
    }
    100%{
      transform: translateY(0);
    }
  }
</style>
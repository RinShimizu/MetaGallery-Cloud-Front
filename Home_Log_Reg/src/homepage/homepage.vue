<script setup>
  import Userinfo from "@/components/userinfo.vue";
  import Lhome from "@/components/Lhome.vue";
</script>

<template>
  <div class="header">
    <div class="logo">
      <span class="s1">Meta</span><span class="s2">Gallery </span><span class="s3">Cloud</span>
    </div>
    <div class="searchbox">
      <div id="box">
        <button class="button1"><img src="../assets/搜索.svg" alt=""></button>
        <input type="text" class="input" placeholder="搜索">
        <button class="button2"><img src="../assets/语音.svg" alt=""></button>
      </div>
    </div>
    <div class="post">
      <button>上传文件</button>
    </div>
    <div id="pic">
      <img src="../assets/个人中心-我的.svg" alt=" ">
    </div>
    <div class="user">
      <button><img src="../assets/字体.svg" alt=""></button>
      <div class="info">
        <Userinfo />
      </div>
    </div>

  </div>
  <div class="sidebar">
    <ul class="menu">
      <li>
        <img src="../assets/图片1.png" alt="">
        <button>首页</button>
      </li>
      <li>
        <img src="../assets/图片2.png" alt="">
        <button>画廊</button>
      </li>
      <li>
        <img src="../assets/图片3.png" alt="">
        <button>我的文件</button>
      </li>
      <li>
        <img src="../assets/图片4.png" alt="">
        <button>我的共享</button>
      </li>
      <li>
        <img src="../assets/图片5.png" alt="">
        <button>回收站</button>
      </li>
    </ul>
    <div class="bottom-image">
      <img src="../assets/图片6.png" alt="底部图片" />
    </div>
  </div>
  <div class="content">
    <Lhome />

  </div>
</template>

<style scoped>
  .header{
    height: 80px;
    width: 100%;
    display: table;
  }

  .logo{
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    width: 20%;
  }
  .s1{
    font-size: 28px;
    color: red;
    font-family: 微软雅黑;
  }
  .s2{
    font-size: 28px;
    color: yellow;
    font-family: 微软雅黑;
  }
  .s3{
    font-size: 28px;
    color: dodgerblue;
    font-family: 微软雅黑;
  }

  .searchbox{
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    width: 50%;
  }
  #box{
    border: gray solid 1px;
    width: max-content;
    height: 40px;
    position: relative;
    left: 40%;
    display: flex;
    align-items: center;
  }
  .button1{
    background-color: transparent;
    border: none;
    margin: 0 15px 0 10px;
  }
  .button1 img{
    width: 20px;
    height: 20px;
  }
  .button2{
    background-color: transparent;
    border: none;
    margin: 0 10px 0 15px;
  }
  .button2 img{
    width: 20px;
    height: 20px;
  }
  .input{
    border: none;
    text-align: center;
    font-size: 20px;
    outline: none;
  }

  .post{
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    width: 10%;
  }
  .post button{
    height: 40px;
    width: 100px;
    font-size: 20px;
    background-color: #4095E5;
    color: white;
    border-radius: 5%;
    border: 2px solid #4095E5;
    transition-duration: 0.2s;
  }
  .post button:hover{
    background-color: white;
    color: #4095E5;
    border: 1px solid #4095E5;
  }

  #pic{
    display: table-cell;
    vertical-align: middle;
    text-align: right;
    width: 10%;
  }
  #pic img{
    width: 30px;
    height: 30px;
  }
  
  .user{
    display: table-cell;
    vertical-align: middle;
    text-align: center;
  }
  .user button{
    background-color: transparent;
    border: none;
  }
  .user button img{
    width: 30px;
    height: 30px;
  }
  .info{
    position: absolute;
    top: 55px;
    right: 0;
    display: none;
    z-index: 99;
  }
  .user button:hover +.info{
    display: block;
  }
  .info:hover {
    display: block;
  }
  .sidebar {
    position: absolute;
    left: 0;
    top: 80px;
    width: 15%; /* 侧边栏宽度 */
    height: calc(100vh - 80px); /* 全屏高度 */
    background-color: white; /* 背景颜色 */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .menu {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  .menu li {
    font-size: 16px;
    padding: 10px;
    display: inline-flex;
    vertical-align: middle;
    text-align: left;
    background-color: #93d2f377;
    border-radius: 20px;
    height: 50px;
    width: 100%;
    border: none;
  }
  .menu button{
    border: none;
    background-color: transparent;
  }
  .menu li:hover {
    background-color: #34495e; /* 悬停时的背景颜色 */
    border-radius: 4px;
  }

  .bottom-image {
    margin: 20px;
    text-align: center;
  }

  .bottom-image img {
    width: 80%;
    height: auto;
    border-radius: 8px; /* 可选：圆角样式 */
  }

  .content {
    position: absolute;
    top: 80px; /* 距离头部高度 */
    left: 15%; /* 距离侧边栏宽度 */
    padding: 20px;
    background-color: #f5f5f5;
    height: calc(100vh - 80px);
    width: 90%;
  }
</style>
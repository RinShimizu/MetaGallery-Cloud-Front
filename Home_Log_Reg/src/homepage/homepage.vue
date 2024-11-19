<script setup>
  import { ref } from 'vue';
  import Userinfo from "@/components/userinfo.vue";

  //用户信息加载,不要重复写
  //包括name,account,avatar,intro,token(这个在userdata里，别的在userinfo里)
  const userData = JSON.parse(localStorage.getItem('userData'));
  var userInfo = userData.data.userInfo;


  //切换界面
  const selectedIndex = ref(0); // 默认选中第一个按钮
  const selectButton = (index) => {
    selectedIndex.value = index;
  };

  
  var imgURL = userInfo.avatar;
  function clear() {
    document.querySelector('.input').value = '';
  }


  //上传文件
  const fileInput = ref(null);
  const selectedFile = ref(null);
  const handleFileUpload = async () => {
    fileInput.value.click();
  };
  const handleFileChange = (event) => {
    const file = event.target;
    if (file) {
      selectedFile.value = file;
      uploadFile();
    }
  };
  const uploadFile = async () => {
    if (!selectedFile.value) {
      alert('请选择一个文件');
      return;
    }
    var myHeaders = new Headers();
    myHeaders.append("Authorization",userData.data.token);

    var formdata = new FormData();
    formdata.append("account", userInfo.account);
    formdata.append("parent_id", "1");//此处获取父文件夹id
    formdata.append("file_name", selectedFile.value.files[0].name);
    formdata.append("file", selectedFile.value.files[0], selectedFile.value.value);

    console.log(formdata);
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow'
    };

    fetch("http://localhost:8080/api/uploadFile", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
  };
</script>

<template>
  <div class="header">
    <div class="logo">
      <span id="s1">Meta</span><span id="s2">Gallery </span><span id="s3">&ensp;Cloud</span>
    </div>
    <div class="searchbox">
      <button class="button1"><img src="../assets/搜索.svg" alt=""></button>
      <input type="text" class="input" placeholder="搜索">
      <button class="button2" @click="clear"><img src="../assets/取消.svg" alt=""></button>
    </div>
    <button id="post" @click="handleFileUpload">
      <img src="../assets/上传.svg" alt="" width="25" height="25"> 上传文件
    </button>
    <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" />
    <div class="user">
      <img id="pic" src="../assets/个人中心-我的.svg" alt=" ">
      <button><img :src=imgURL alt=""></button>
      <div class="info">
        <Userinfo />
      </div>
    </div>

  </div>
  <div class="sidebar">
    <div class="menu">
      <router-link to="/">
        <button :class="{ active: selectedIndex === 0 }" @click="selectButton(0)"><img src="../assets/文件.svg" alt="">我的文件</button>
      </router-link>
      <router-link to="/share">
        <button :class="{ active: selectedIndex === 1 }" @click="selectButton(1)"><img src="../assets/分享.svg" alt="">我的共享</button>
      </router-link>
      <router-link to="/star">
        <button :class="{ active: selectedIndex === 2 }" @click="selectButton(2)"><img src="../assets/收藏.svg" alt="">我的收藏</button>
      </router-link>
      <router-link to="/gallery">
        <button :class="{ active: selectedIndex === 3 }" @click="selectButton(3)"><img src="../assets/图片.svg" alt="">画廊</button>
      </router-link>
      <router-link to="/rubbish">
        <button :class="{ active: selectedIndex === 4 }" @click="selectButton(4)"><img src="../assets/回收站.svg" alt="">回收站</button>
      </router-link>
    </div>
    <div class="bottom-image">
      <img src="../assets/图片6.png" alt="底部图片" />
    </div>
  </div>
  <div class="content">
    <nav>

    </nav>
    <router-view></router-view>

  </div>
</template>

<style scoped>
  #block_home{
    display: none;
  }
  /*头部*/
  .header{
    height: 60px;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: white;
    display: inline-flex;
    box-shadow:0 3px 5px  rgba(0,0,0,0.18);
    font-size: 30px;
    z-index: 3;
  }

  .logo{
    display: inline-flex;
    position: relative;
    width: max-content;
    margin: auto 30px auto 20px;
  }
  #s1{
    width: max-content;
    font-size: 70%;
    color: #EE6363;
    font-family: Verdana;
    font-weight: bold;
  }
  #s2{
    width: max-content;
    font-size: 70%;
    color: #FFA54F;
    font-family: Verdana;
    font-weight: bold;
  }
  #s3{
    width: max-content;
    font-size: 70%;
    color: #63B8FF;
    font-family: Verdana;
    font-weight: bold;
  }

  .searchbox{
    position: relative;
    margin: auto 10% auto 15%;
    border-radius: 2px;
    border: #eee9e966 solid 1px;
    width: max-content;
    height: 40px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px rgba(0, 0, 0, 0.2);
    background-color: #eee9e933;
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
    font-size: 60%;
    width: 350px;
    outline: none;
    background-color: transparent;
  }
  input:focus::placeholder{
    opacity: 0;
  }

  #post{
    position: relative;
    margin: auto 5%;
    height: 40px;
    width: 160px;
    font-size: 20px;
    background-color: #4095E5;
    color: white;
    border-radius: 25px;
    border: 2px solid #4095E5;
    transition-duration: 0.2s;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  #post:hover{
    background-color: white;
    color: #4095E5;
    border: 1px solid #4095E5;
  }
  #post:hover img{
    content:url("../assets/上传_hover.svg");
  }
  
  .user{
    position: relative;
    display: inline-flex;
    width: 15%;
    height: 100%;
    margin: auto 0 auto 10px;
  }
  #pic{
    position: relative;
    margin: auto 10px auto auto;
    width: 40px;
    height: 40px;
  }
  .user button{
    position: relative;
    margin: auto auto auto 10px;
    background-color: transparent;
    border: none;
    width: 50px;
    height: 50px;
  }
  .user button img{
    width: 100%;
    height: auto;
  }
  .info{
    position: absolute;
    top: 50px;
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

  /*侧边栏*/
  .sidebar {
    position: absolute;
    left: 0;
    top: 60px;
    width: 15%; /* 侧边栏宽度 */
    height: calc(100vh - 60px); /* 全屏高度 */
    background-color: white; /* 背景颜色 */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 2;
    box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);
  }

  .menu {
    display: inline-flex;
    flex-direction: column;
    padding: 0;
    margin:10px 0 0 0;
    font-size: 16px;
    height: max-content;
    width: 100%;
    border: none;
  }
  .menu button{
    width: 100%;
    height: 50px;
    border: none;
    border-radius: 22px;
    display: inline-flex;
    justify-content: left;
    align-items: center;
    gap: 15px;
    background-color: white;
    font-size: 15px;
    font-family: 幼圆;
    transition-duration: 0.2s;
  }
  .menu button.active{
    background-color: #93d2f377;
  }
  .menu button img {
    margin-left: 15px;
    width: 20px;
    height: auto;
  }

  .bottom-image {
    margin: 28px;
    text-align: center;
  }

  .bottom-image img {
    width: 80%;
    height: auto;
    border-radius: 8px; /* 可选：圆角样式 */
  }

  .content {
    position: relative;
    top: 60px; /* 距离头部高度 */
    left: 15%; /* 距离侧边栏宽度 */
    height: calc(100vh - 60px);
    width: 90%;
  }
</style>
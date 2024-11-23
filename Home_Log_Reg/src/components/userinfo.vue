<script setup>
  import { ref } from 'vue'
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
  };
</script>

<template>
  <div class="userinfo">
    <img :src=imgURL alt="我是头像">
    <p>昵称：{{name}}</p>
    <p>账号：{{account}}</p>
    <div id="buttons">
      <button @click="toPerson">查看个人资料</button>
      <button @click="exit">退出</button>
      <button @click="changeAccount">切换账号</button>
    </div>
  </div>
</template>

<style scoped>
  .userinfo{
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    border: none;
    box-shadow: 0 2px 5px 2px rgba(0, 0, 0, 0.2);
    width: 300px;
    height: 300px;
    border-radius: 40px;
  }
  .userinfo img{
    margin: 10px auto ;
    width: 50px;
    height: 50px;
  }
  p{
    font-size: 18px;
    margin: 5px auto;
  }
  #buttons{
    display: flex;
    flex-direction: column;
  }
  #buttons button{
    margin: 5px auto;
    height: 40px;
    width: 200px;
    border: none;
    border-radius: 15px;
    background-color: #4095E5;
    font-size: 15px;
    font-family: 黑体;
    color: white;
    transition-duration: 0.1s;
  }
  #buttons button:hover{
    background-color: white;
    color: #4095E5;
    border: 2px solid #4095E5;
  }
</style>
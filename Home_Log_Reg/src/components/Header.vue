<script setup>
  let h_home = document.getElementById("page1").offsetHeight
  let h_case = document.getElementById("page2").offsetHeight
  function Reg(){
    window.open('../public/register.html');//在当前页面直接打开，加_self
  }
  function Log(){
    window.open('../public/load.html');
  }
  function toHome(){
    window.scrollTo({top:0,behavior:'smooth'})
  }
  function toCase(){
    window.scrollTo({top:h_home,behavior:'smooth'})
  }
  function toCont(){
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
  .Navi{
    height: 90px;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: white;
    //border-bottom:2px #4095E5 solid;
    display: inline-flex;
    box-shadow:0 5px 5px  rgba(0,0,0,0.18);
    font-size: 30px;
  }

  .Logo{
    position: relative;
    left: 3%;
    color: #4095E5;
    font-family: 微软雅黑;
    font-size: 100%;
    margin:auto 0;
  }

  .link{
    display: inline-flex;
    position: relative;
    left: 10%;
  }
  .link button{
    position: relative;
    height: 65px;
    width: 150px;
    font-size: 70%;
    background-color: white;
    color: #4095E5;
    border-radius: 5%;
    border: 2px solid white;
    transition-duration: 0.2s;
    vertical-align: middle;
    margin:auto 30px;
  }
  .link button:hover{
    background-color: white;
    color: #4095E5;
    border: 2px solid white;
    box-shadow: 0 5px 10px 0 rgba(0,0,0,0.15), 0 10px 25px 0 rgba(0,0,0,0.1);
    border-radius: 10%;
    padding: 10px 20px 20px 20px;
  }

  .user{
    display: inline-flex;
    position: relative;
    left: 20%;
  }
  #btn1{
    position: relative;
    vertical-align: middle;
    height: 55px;
    width: 120px;
    font-size: 70%;
    background-color: #4095E5;
    color: white;
    border-radius: 5%;
    border: 2px solid #4095E5;
    transition-duration: 0.2s;
    margin: auto 30px;
  }
  #btn2{
    position: relative;
    vertical-align: middle;
    height: 55px;
    width: 120px;
    font-size: 70%;
    background-color: #4095E5;
    color: white;
    border-radius: 5%;
    border: 2px solid #4095E5;
    transition-duration: 0.2s;
    margin: auto 30px;
  }
  #btn1:hover{
    background-color: white;
    color: #4095E5;
    border: 2px solid #4095E5;
    box-shadow: 0 5px 10px 0 rgba(0,0,0,0.15), 0 10px 25px 0 rgba(0,0,0,0.1);
  }
  #btn2:hover{
    background-color: white;
    color: #4095E5;
    border: 2px solid #4095E5;
    box-shadow: 0 5px 10px 0 rgba(0,0,0,0.15), 0 10px 25px 0 rgba(0,0,0,0.1);
  }
</style>
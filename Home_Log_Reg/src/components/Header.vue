<script setup>
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
    window.scrollTo({top:600,behavior:'smooth'})
  }
  function toCont(){
    window.scrollTo({top:800,behavior:'smooth'})
  }
</script>

<template>
  <div class="Navi">
    <p class="Logo">MetaGallery Cloud</p>
    <button class="item" @click="toHome">首页</button>
    <button class="item" @click="toCase">案例展示</button>
    <button class="item" @click="toCont">联系我们</button>
    <button @click="Reg">注册</button>
    <button @click="Log">登录</button>
  </div>
</template>

<style scoped>
  .Navi{
    height: 120px;
    width: 100%;
    position: fixed;
    top: 0;
    background-color: white;
    border-bottom:2px #4095E5 solid;
  }
  .Logo{
    color: #4095E5;
    font-family: 微软雅黑;
    font-size: 35px;
    float: left;
    padding:0 100px 0 60px;
  }
  .item{
    font-size: 25px;
    background-color: white;
    color: #4095E5;
    border-radius: 5%;
    border: 2px solid white;
    transition-duration: 0.2s;
    float: left;
    justify-content: center;
    margin: 30px 30px;
    padding: 15px 20px;
  }

  .item:hover{
    background-color: white;
    color: #4095E5;
    border: 2px solid white;
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
    border-radius: 10%;
    padding: 10px 20px 20px 20px;
  }

  button{
    height: 65px;
    width: 150px;
    font-size: 20px;
    background-color: #4095E5;
    color: white;
    border-radius: 5%;
    border: 2px solid #4095E5;
    transition-duration: 0.2s;
    float: right;
    margin: 30px 30px;
  }

  button:hover{
    background-color: white;
    color: #4095E5;
    border: 2px solid #4095E5;
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
  }
</style>
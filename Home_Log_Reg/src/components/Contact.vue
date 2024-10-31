<script setup>

</script>

<template>
  <div class="Contact">
    <div class="box">
      <button><img src="../assets/QQ.svg" alt="qq"></button>
      <button><img src="../assets/新浪微博.svg" alt="qq"></button>
      <button><img src="../assets/微信.svg" alt="qq"></button>
      <button><img src="../assets/邮件.svg" alt="qq"></button>
    </div>
    <span>©2024.only我们小组版权所有</span>
  </div>
</template>

<style scoped>
  .Contact{
    position: absolute;
    height: max-content;
    width: 100%;
    margin-top: 1650px;
    left: 0;
    z-index: -1;
    text-align: center;
  }
  .box{
    position: relative;
    text-align: center;
    margin-bottom: 10px;
  }
  button{
    position: relative;
    border-radius: 50%;
    background-color: transparent;
    border: none;
    height: 60px;
    width: 60px;
    margin: 0 10px 0 10px;
  }
  button::after{
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #4095E5;
    z-index: -1;
  }
  button img{
    height: 70%;
    width: auto;
  }

  span{

  }
</style>
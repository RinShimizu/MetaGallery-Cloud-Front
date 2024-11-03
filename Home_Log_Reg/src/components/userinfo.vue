<script setup>
  import { ref } from 'vue'
  const name = ref("111");
  const user = ref("111");
  function toPerson(){
    window.open('../public/person.html','_blank');
  }
</script>

<template>
  <div class="userinfo">
    <img src="../assets/字体.svg" alt="我是头像">
    <p>昵称：{{name}}</p>
    <p>账号：{{user}}</p>
    <div id="buttons">
      <button @click="toPerson">查看个人资料</button>
      <button>退出</button>
      <button>切换账号</button>
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
    margin: 15px auto ;
    width: 30px;
    height: 30px;
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
<script setup>
  import { ref } from 'vue'
  const name = ref("111");
  const user = ref("111");
  function toPerson(){
    window.open('../public/person.html','_self');
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
    background-color: white;
    border: black 1px solid;
    width: 300px;
    height: 300px;
    border-radius: 20px;
  }
  .userinfo img{
    margin: 20px 0 0 0 ;
    width: 30px;
    height: 30px;
  }
  #buttons{
    display: flex;
    flex-direction: column;
  }
  #buttons button{
    height: 40px;
    width: 150px;
    margin: 5px auto;
  }
</style>
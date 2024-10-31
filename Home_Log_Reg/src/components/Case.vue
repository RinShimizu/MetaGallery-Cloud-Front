<script setup>

</script>

<template>
  <div class="Case">
    <div class="box">
      <img src="../assets/case1.png" alt="case1">
      <img src="../assets/case2.png" alt="case2">
      <img src="../assets/case3.png" alt="case3">
      <img src="../assets/case4.png" alt="case4">
      <img src="../assets/case1.png" alt="case5">
    </div>
    <p class="induct">我是案例</p>
  </div>
</template>

<style scoped>
  .Case{
    position: absolute;
    height: 800px;
    width: 100%;
    margin-top: 900px;
    left: 0;
    z-index: -1;
  }
  .induct{
    width: 500px;
    height: 500px;
    border: black solid 2px;
    float: left;
  }
  .box {
    position: relative;
    width: 50%;
    height: auto;
    margin: 0 auto;
    overflow: hidden;
    border: black 1px solid;
    display: flex;
  }

  .box img {
    width: 100%;
    height: auto;
    animation: slideImages 20s linear infinite;
  }

  @keyframes slideImages {
    0% { transform: translateX(0); }
    22% { transform: translateX(0); }
    25% { transform: translateX(-100%); }
    47% { transform: translateX(-100%); }
    50% { transform: translateX(-200%); }
    72% { transform: translateX(-200%); }
    75% { transform: translateX(-300%); }
    97% { transform: translateX(-300%); }
    100% { transform: translateX(-400%); }
  }

</style>
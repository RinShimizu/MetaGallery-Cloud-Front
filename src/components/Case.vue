<script setup>

</script>

<template>
  <div class="Case" id="page2">
    <h2>案例展示</h2>
    <div class="box">
      <img src="../assets/case1.png" alt="case1">
      <img src="../assets/case2.png" alt="case2">
      <img src="../assets/case3.png" alt="case3">
      <img src="../assets/case4.png" alt="case4">
      <img src="../assets/case1.png" alt="case5">
    </div>
  </div>
</template>

<style scoped>
.Case {
  position: absolute;
  height: 800px;
  width: 100%;
  margin-top: 900px;
  left: 0;
  z-index: -1;
  background: white;
}

h2 {
  font-size: 40px;
  text-align: center;
  margin: 0 auto 40px auto;
  color: #2c3e50;
  position: relative;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #4095E5;
  border-radius: 2px;
}

.box {
  position: relative;
  width: 60%;
  height: auto;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
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
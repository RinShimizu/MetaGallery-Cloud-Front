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
.Contact {
  position: absolute;
  height: max-content;
  width: 100%;
  margin-top: 1650px;
  left: 0;
  z-index: -1;
  text-align: center;
  background: #f8f9fa;
  padding: 40px 0;
}

.box {
  position: relative;
  text-align: center;
  margin-bottom: 20px;
}

button {
  position: relative;
  border-radius: 50%;
  background: white;
  border: none;
  height: 50px;
  width: 50px;
  margin: 0 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

button:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(64, 149, 229, 0.2);
}

button img {
  height: 25px;
  width: 25px;
  transition: all 0.3s ease;
}

button:hover img {
  transform: scale(1.1);
}

span {
  display: block;
  color: #666;
  font-size: 14px;
  margin-top: 20px;
}

button::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #4095E5;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

button:hover::after {
  opacity: 0.1;
}
</style>
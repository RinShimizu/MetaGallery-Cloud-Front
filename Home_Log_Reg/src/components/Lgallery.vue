<script setup>
  import { ref,computed } from 'vue';
  import Content from "@/components/Content.vue";
  const files = ref([
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'},
    {img:'src/assets/case1.png',avatar:'',title:'标题'}
  ])

  const selectedIndex = ref(1); // 默认选中第一个按钮

  const selectButton = (index) => {
    selectedIndex.value = index;
  };
  const selectIncrement = () => {
    selectedIndex.value += 1;
  }
  const selectDecrement = () => {
    selectedIndex.value -= 1;
  }
</script>

<template>
  <div id="gallery_box">
    <p>画廊</p>
    <div class="content_box">
      <div class="file_box">
        <div class="item" v-for="(file,index) in files" :key="index">
          <img id="cover" :src=file.img alt="封面">
          <img id="avatar" :src=file.avatar alt="我">
          <span>{{file.title}}</span>
        </div>
      </div>
      <div class="pages">
        <button id="left" :class="{ disabled: selectedIndex === 1 }" @click="selectDecrement"><img src="../assets/向左箭头.svg" alt=""></button>
        <button id="1" :class="{ active: selectedIndex === 1 }" @click="selectButton(1)">1</button>
        <button id="2" :class="{ active: selectedIndex === 2 }" @click="selectButton(2)">2</button>
        <button id="3" :class="{ active: selectedIndex === 3 }" @click="selectButton(3)">3</button>
        <button id="4" :class="{ active: selectedIndex === 4 }" @click="selectButton(4)">4</button>
        <button id="5" :class="{ active: selectedIndex === 5 }" @click="selectButton(5)">5</button>
        <button id="right" :class="{ disabled: selectedIndex === 5 }" @click="selectIncrement"><img src="../assets/向右箭头.svg" alt=""></button>
      </div>
    </div>
    <div class="details">
      <Content />
    </div>
  </div>
</template>

<style scoped>
  #gallery_box{
    position: relative;
    height: calc(100vh - 60px);
    width: 90%;
    left: 0;
    top: 0;
  }
  p{
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-family: 幼圆;
    margin: 15px 0 0 15px ;
  }
  p::before{
    content: "";
    background-image: url("../assets/图片.svg");
    display: inline-block;
    width: 20px; /* 控制宽度 */
    height: 20px; /* 控制高度 */
    background-size: contain; /* 图片自适应大小 */
    background-repeat: no-repeat;
    background-position: center;
  }
  .content_box{
    position: relative;
    margin: 20px 30px;
    width: 100%; /* 列表宽度 */
    height: 90%;
    border: #cccccc 1px solid;
    border-radius: 20px;
    display: none;
  }
  .file_box{
    display: grid;
    width: 100%;
    height: 90%;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    place-items: center;
    margin-top: 10px;
  }
  .item{
    display: grid;
    position: relative;
    grid-template-rows: 7fr 3fr; /* 两行，每行高度相等 */
    grid-template-columns: 3fr 7fr; /* 第二行的两列，比例为 3:7 */
    grid-template-areas:
    "a a" /* 第一行只有一列，占据整个宽度 */
    "b c";
    width: 70%;
    height: max-content;
    overflow: hidden;
    padding: 5px;
  }
  .item:hover {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    border: #4095E5 1px solid;
    border-radius: 10px;
  }
  .item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.3); /* 透明黑色覆盖层 */
    opacity: 0; /* 初始状态下不显示 */
    transition: opacity 0.3s ease;
  }
  .item:hover::before {
    opacity: 1; /* 悬停时显示覆盖层 */
  }
  #cover{
    grid-area: a;
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
  #avatar{
    grid-area: b;
    height: 100%;
    width: 100%;
  }
  .item span{
    grid-area: c;
    height: 100%;
    width: 100%;
  }

  .pages{
    display: flex;
    width: 100%;
    justify-content: center; /* 水平居中 */
    align-items: center;
    margin-top: 20px;
    gap: 15px;
  }
  .pages button{
    width: 30px;
    height: 30px;
    background-color: transparent;
    border: none;
  }
  .pages button:hover{
    color: #4095E5;
  }
  .pages button.active{
    color: #4095E5;
  }
  #left:hover img{
    content:url("../assets/向左箭头h.svg");
  }
  #left.disabled img{
    content:url("../assets/向左箭头c.svg");
  }
  #left.disabled{
    pointer-events: none;
  }
  #right:hover img{
    content:url("../assets/向右箭头h.svg");
  }
  #right.disabled img{
    content:url("../assets/向右箭头c.svg");
  }
  #right.disabled{
    pointer-events: none;
  }
  #left img,#right img{
    height: 100%;
    width: 100%;
  }

  .details{
    position: relative;
    margin: 20px 30px;
    width: 100%; /* 列表宽度 */
    height: 90%;
    border: #cccccc 1px solid;
    border-radius: 20px;
    display: flex;
  }
</style>
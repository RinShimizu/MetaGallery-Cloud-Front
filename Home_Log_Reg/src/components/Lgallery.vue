<script setup>
  import { ref,computed } from 'vue';
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
        <button>上一页</button>
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
        <button>5</button>
        <button>下一页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  #gallery_box{
    position: relative;
    width: 100%;
    height: 100%;
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
  }
  .file_box{
    display: grid;
    width: 100%;
    height: 90%;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    justify-items: center;
    align-items: center;
  }
  .item{
    display: grid;
    grid-template-rows: 7fr 3fr; /* 两行，每行高度相等 */
    grid-template-columns: 3fr 7fr; /* 第二行的两列，比例为 3:7 */
    grid-template-areas:
    "a a" /* 第一行只有一列，占据整个宽度 */
    "b c";
    width: 70%;
    height: max-content;
    border: blue 1px solid;

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
</style>
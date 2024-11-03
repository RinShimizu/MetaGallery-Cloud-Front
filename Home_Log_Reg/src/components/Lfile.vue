<script setup>
  import { ref,computed } from 'vue';
  import fileURL from '../assets/文件.svg';
  import folderURL from '../assets/文件夹.svg';

  const files = ref([
    { name: '文件1.txt', icon: fileURL, selected: false },
    { name: '文件2.doc', icon: fileURL, selected: false },
    { name: '文件3.pdf', icon: folderURL, selected: false },

  ]);
  const isAnyFileSelected = computed(() => {
    return files.value.some(file => file.selected);
  });
</script>

<template>
  <div id="filebox">
    <p>我的文件</p>
    <div class="file_op">
      <div class="file-list">
        <div class="file-item" v-for="(file, index) in files" :key="index">
          <img :src="file.icon" alt="文件图标" class="file-icon" />
          <span class="file-name">{{ file.name }}</span>
          <input type="checkbox" v-model="file.selected" class="file-checkbox" />
        </div>
      </div>
      <div class="file-operations" v-if="isAnyFileSelected">
        <button><img src="../assets/下载.svg" alt="">下载</button>
        <button><img src="../assets/分享.svg" alt="">共享</button>
        <button><img src="../assets/回收站.svg" alt="">删除</button>
        <button><img src="../assets/收藏.svg" alt="">收藏</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  #filebox{
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
    background-image: url("../assets/文件.svg");
    display: inline-block;
    width: 20px; /* 控制宽度 */
    height: 20px; /* 控制高度 */
    background-size: contain; /* 图片自适应大小 */
    background-repeat: no-repeat;
    background-position: center;
  }

  .file_op{
    position: relative;
    margin: 20px 30px;
    width: 100%; /* 列表宽度 */
    height: 90%;
    border: #cccccc 1px solid;
    border-radius: 20px;
  }

  .file-list {
    display: flex;
    flex-direction: column; /* 单列显示 */
    width: 100%; /* 列表宽度 */
    height: 90%;
    overflow-y: auto;
  }
  .file-item {
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between; /* 左右对齐 */
    padding: 8px;
    border-bottom: 1px solid #ddd; /* 分隔线 */
  }
  .file-icon {
    width: 20px;
    height: 20px;
    margin: 0 8px 0 12px; /* 图标和文件名之间的间距 */
  }
  .file-name {
    font-size: 16px;
    flex: 1; /* 文件名占用剩余空间 */
  }
  .file-checkbox {
    margin-left: 8px; /* 文件名和复选框之间的间距 */
  }

  .file-operations{
    position: absolute;
    bottom: 0;
    display: inline-flex;
    width: 100%;
    z-index: 2;
    background-color: white;
  }
  .file-operations button{
    display: inline-flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 5%;
    aspect-ratio: 1 / 1;
    margin: auto;
    border: none;
    background-color: transparent;
  }
  .file-operations button img{
    width: 50%;
    height: auto;
  }
</style>
<script setup>
import {computed, ref} from "vue";
  import fileURL from "@/assets/文件.svg";
  import folderURL from "@/assets/文件夹.svg";

  const files = ref([
    { name: '文件1.txt', icon: fileURL, selected: false },
    { name: '文件2.doc', icon: fileURL, selected: false },
    { name: '文件3.pdf', icon: folderURL, selected: false },
    { name: '文件1.txt', icon: fileURL, selected: false },
    { name: '文件2.doc', icon: fileURL, selected: false },
    { name: '文件3.pdf', icon: folderURL, selected: false },
    { name: '文件1.txt', icon: fileURL, selected: false },
    { name: '文件2.doc', icon: fileURL, selected: false },
    { name: '文件3.pdf', icon: folderURL, selected: false },
    { name: '文件1.txt', icon: fileURL, selected: false },
    { name: '文件2.doc', icon: fileURL, selected: false },
    { name: '文件3.pdf', icon: folderURL, selected: false },
    { name: '文件1.txt', icon: fileURL, selected: false },
    { name: '文件2.doc', icon: fileURL, selected: false },
    { name: '文件3.pdf', icon: folderURL, selected: false },
    { name: '文件1.txt', icon: fileURL, selected: false },
    { name: '文件2.doc', icon: fileURL, selected: false },
    { name: '文件3.pdf', icon: folderURL, selected: false },
    { name: '文件1.txt', icon: fileURL, selected: false },
    { name: '文件2.doc', icon: fileURL, selected: false },
    { name: '文件3.pdf', icon: folderURL, selected: false }

  ]);
  const isAnyFileSelected = computed(() => {
    return files.value.some(file => file.selected);
  });
</script>

<template>
  <div class="file">
    <span id="induct">一段描述</span>
    <div class="file-list">
      <div class="file-item" v-for="(file, index) in files" :key="index">
        <img :src="file.icon" alt="文件图标" class="file-icon" />
        <span class="file-name">{{ file.name }}</span>
        <input type="checkbox" v-model="file.selected" class="file-checkbox" />
      </div>
    </div>
    <div class="file-operations" v-if="isAnyFileSelected">
      <button><img src="../assets/下载.svg" alt="">下载</button>
      <button><img src="../assets/展开.svg" alt="">转存</button>
      <button><img src="../assets/收藏.svg" alt="">收藏</button>
    </div>
  </div>
  <div class="info">
    <button><img src="" alt="我"></button>
    <span>账号</span>
    <span>签名签名签名签名</span>
  </div>
</template>

<style scoped>
  .file{
    position: relative;
    flex: 1;
  }
  #induct{
    position: absolute;
    padding: 10px;

  }
  .file-list {
    display: flex;
    flex-direction: column; /* 单列显示 */
    width: 90%; /* 列表宽度 */
    height: 80%;
    overflow-y: auto;
    z-index: -1;
    border: #cccccc 1px solid;
    margin-left: 20px;
    position: absolute;
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
    border-radius: 20px;
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

  .info{
    height: 90%;
    width: 15%;
    border: #cccccc 1px solid;
    margin: auto 30px auto 0;
  }
  .info button{
    position: relative;
    margin: auto auto auto 10px;
    background-color: transparent;
    border: none;
    width: 50px;
    height: 50px;
  }
  .info button img{
    width: 100%;
    height: auto;
  }
</style>
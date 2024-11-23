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
  <div id="content_box">
    <router-link to="/gallery"><p>返回画廊</p></router-link>
    <div class="details">
      <div class="file">
        <div class="induct">
          <span>一段描述</span>
        </div>
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
    </div>
  </div>
</template>

<style scoped>
  #content_box{
    position: relative;
    height: calc(100vh - 60px);
    width: 90%;
    left: 0;
    top: 0;
  }
  a{
    display: block;
    width: max-content;
    text-decoration:none;
  }
  a:visited {
    color: black !important;
  }
  p{
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-family: 幼圆;
    margin: 15px 0 20px 15px ;
    width: max-content;
  }
  p::before{
    content: "";
    background-image: url("../assets/返回.svg");
    display: inline-block;
    width: 20px; /* 控制宽度 */
    height: 20px; /* 控制高度 */
    background-size: contain; /* 图片自适应大小 */
    background-repeat: no-repeat;
    background-position: center;
  }

  .details{
    position: relative;
    margin: 0 30px 20px 30px;
    width: 100%; /* 列表宽度 */
    height: 90%;
    border: #cccccc 1px solid;
    border-radius: 20px;
    display: flex;
  }
  .file{
    position: relative;
    flex: 1;
  }
  .induct{
    padding: 10px;
    top: 10px;
    height: 15%;
    margin: 10px 20px;
  }
  .file-list {
    display: flex;
    flex-direction: column; /* 单列显示 */
    width: 90%; /* 列表宽度 */
    height: 50%;
    overflow-y: auto;
    border: #cccccc 1px solid;
    margin: 10px 20px;
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
    border: #cccccc 2px solid;
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
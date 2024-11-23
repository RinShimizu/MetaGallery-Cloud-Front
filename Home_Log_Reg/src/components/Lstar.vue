<script setup>
import {ref, computed, onMounted} from 'vue';
import fileURL from '../assets/文件.svg';
import folderURL from '../assets/文件夹.svg';
import {fetchSubFileInfo, getTopOfFileStack,fetchSubFolderInfo,getTopOfFolderStack} from "@/homepage/api.js";
const userData = JSON.parse(localStorage.getItem('userData'));
var userInfo = userData.data.userInfo;
var files = ref([]);
var folders = ref([]);
// onMounted(async () =>{
//   await fetchSubFileInfo(userData.data.token, userInfo.account,1);
//   files.value = getTopOfFileStack();
// })
const isAnyFileSelected = computed(() => {
  return files.value.some(file => file.selected);
});
// 过滤出已收藏的文件
const favoriteFiles = computed(() => {
  return files.value.filter(file => file.isFavorite);
});
const favoriteFolders = computed(() => {
  return folders.value.filter(folder => folder.is_favorite);
});
onMounted(async () => {
  const filePromise = fetchSubFileInfo(userData.data.token, userInfo.account, 1);
  const folderPromise = fetchSubFolderInfo(userData.data.token, userInfo.account, 1);

  await Promise.all([filePromise, folderPromise]); // 同时加载
  files.value = getTopOfFileStack();
  folders.value = getTopOfFolderStack();
  console.log("2"+files.value);
  console.log("1"+folders.value);
});
// 处理点击文件夹进入
const handleFolderClick = (folder) => {
  // 更新当前路径
  curPath = folder;
  // 假设你有一个方法来获取文件夹下的文件
  loadFilesInFolder(folder.id);
};
</script>

<template>
  <div id="filebox">
    <p>我的收藏</p>
    <div class="file_op">
      <div class="file-list">

        <div class="file-item" v-for="(folder, index) in favoriteFolders" :key="folder.id" @click="handleFolderClick(folder)">
          <img :src="folderURL" alt="文件夹图标" class="file-icon" />

          <span class="file-name">{{ folder.folder_name }}</span>
          <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->

        </div>

        <div class="file-item" v-for="(file, index) in favoriteFiles" :key="index">
          <img :src="fileURL" alt="文件图标" class="file-icon" />
          <span class="file-name">{{ file.FileName }}</span>
          <input type="checkbox" v-model="file.selected" class="file-checkbox" />
        </div>
      </div>
      <div class="file-operations" v-if="isAnyFileSelected">
        <button><img src="../assets/下载.svg" alt="">下载</button>
        <button><img src="../assets/回收站.svg" alt="">删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  #filebox{
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
    background-image: url("../assets/收藏.svg");
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
    z-index: -1;
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
    border-radius: 20px;
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
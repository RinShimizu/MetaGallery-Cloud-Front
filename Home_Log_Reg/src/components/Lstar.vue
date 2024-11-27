<script setup>
  import {ref, computed, onMounted} from 'vue';
  import fileURL from '../assets/文件.svg';
  import folderURL from '../assets/文件夹.svg';
  import { fetchSubInfo } from "@/homepage/api.js";


  const userData = JSON.parse(localStorage.getItem('userData'));
  var userInfo = userData.data.userInfo;
  let Stack = []; // 定义一个栈来存储，栈元素是一个二元组，第一个元素为文件夹，第二个元素为文件
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
    return files.value.filter(file => file.Favorite);
  });
  const favoriteFolders = computed(() => {
    return folders.value.filter(folder => folder.isFavorite);
  });
  onMounted(async () => {
    Stack.length = 0;
    await fetchSubInfo(Stack,userData.data.token, userInfo.account,1);
    folders.value = Stack[Stack.length - 1][0];
    files.value = Stack[Stack.length - 1][1];
  });
  // 处理点击文件夹进入
  /*const handleFolderClick = (folder) => {
    // 更新当前路径
    curPath = folder;
    // 假设你有一个方法来获取文件夹下的文件
    loadFilesInFolder(folder.id);
  };*/
  const getFolderFile = async (ID) => {
    console.log("curPathID:"+ID);
    await fetchSubInfo(Stack, userData.data.token, userInfo.account, ID);
    folders.value = Stack[Stack.length - 1][0];
    files.value = Stack[Stack.length - 1][1];
    console.log("Stack:",Stack);
  }


  const goBackToParentFolder = () => {
    if(Stack.length > 1){
      Stack.pop();
      folders.value = Stack[Stack.length - 1][0];
      files.value = Stack[Stack.length - 1][1];
    }
    else{
      showLabelAlert('当前目录为系统默认目录');
    }
  };


  const showLabelAlert = (msg) => {
    const container = document.getElementById('alert-container');

    // 创建提示框元素
    const alertLabel = document.createElement('div');
    alertLabel.className = 'alert-label';
    alertLabel.textContent = msg;

    // 添加提示框到容器中
    container.appendChild(alertLabel);

    // 1 秒后移除提示框
    setTimeout(() => {
      container.removeChild(alertLabel);
    }, 1000);
  };
</script>

<template>
  <div id="filebox">
    <div class="file_header">
      <p>我的收藏</p>
      <div id="alert-container"></div> <!-- 中间的label容器 -->
      <button id="back" @click="goBackToParentFolder">
        <img src="../assets/回退.svg" alt="" style="width: 30px; height: 30px;">
      </button>
    </div>
    <div class="file_op">
      <div class="file-list">
        <div class="file-item" v-for="folder in favoriteFolders" :key="folder.id">
          <img :src=folderURL alt="文件夹图标" class="file-icon" />
          <a href="" class="file-name" @click.prevent="getFolderFile(folder.id)">{{ folder.name }}</a>
          <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->
        </div>
        <div class="file-item" v-for="file in favoriteFiles" :key="file.ID">
          <img :src=fileURL alt="文件图标" class="file-icon" />
          <a href="" class="file-name">{{ file.FileName }}</a>
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
  .file_header{
    position: relative;
    display: flex;
    height: 20px;
    margin: 15px 0 20px 15px;
  }
  .file_header p{
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-family: 幼圆;
    margin: 0;
  }
  .file_header p::before{
    content: "";
    background-image: url("../assets/收藏.svg");
    display: inline-block;
    width: 20px; /* 控制宽度 */
    height: 20px; /* 控制高度 */
    background-size: contain; /* 图片自适应大小 */
    background-repeat: no-repeat;
    background-position: center;
  }
  .file_header button {
    background: none; /* 去掉按钮背景 */
    border: none; /* 去掉按钮边框 */
    padding: 0; /* 去掉内边距 */
    cursor: pointer; /* 设置鼠标指针 */
  }
  /* alert-container 样式 */
  #alert-container {
    flex: 1; /* 让其占据可用空间 */
    text-align: center; /* 文本居中 */
  }

  .file_op{
    position: relative;
    margin: 0 30px 20px 30px;
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
    text-decoration:none;
  }
  .file-name:visited {
    color: black;
  }
  .file-name:hover{
    color: #007bff;
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
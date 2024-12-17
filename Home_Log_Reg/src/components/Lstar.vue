<script setup>
import {ref, computed, onMounted, toRaw} from 'vue';
  import fileURL from '../assets/文件.svg';
  import folderURL from '../assets/文件夹.svg';
import {
  fetchSubInfo,
  showFileOrFolderInfo, hideFileOrFolderInfo, fileOrFolderInfo, popupTop, popupLeft, getCurrentFolderID, searchInStar,
  downloadFile,//下载
  handlepreviewFile, isLoading, favoriteButtonIcon,//预览
  favoriteFolders, favoriteFiles, fetchFavoriteFolders, fetchFavoriteFiles, Stackfa,//获取已收藏文件和文件夹
  markAsFavorite, deleteItems//用于取消收藏
} from "@/homepage/api.js";
  import {useEventBus} from "@vueuse/core";
  import favoriteIcon from "@/assets/已收藏.svg";
  import unfavoriteIcon from "@/assets/收藏.svg";

  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('userData'));
  var userInfo = userData.data.userInfo;
  var account=userInfo.account;
  let Stack = []; // 定义一个栈来存储，栈元素是一个二元组，第一个元素为文件夹，第二个元素为文件
  var files = ref([]);
  var folders = ref([]);
  // onMounted(async () =>{
  //   await fetchSubFileInfo(userData.data.token, userInfo.account,1);
  //   files.value = getTopOfFileStack();
  // })
  const searchQuery = ref(""); // 当前搜索关键字
  const eventBus1 = useEventBus("search-update");
  const performSearch = (query) => {
    console.log(query);
    searchInStar(token, userInfo.account, query)
        .then(({ folder, file }) => {
          Stack.push([folder,file]);
          folders.value=folder;
          files.value=file;
          console.log("Folders:", folder);
          console.log("Files:", file);
        })
        .catch((error) => {
          console.error("Search failed:", error);
        });
  };


  onMounted(() => {
    // 监听搜索内容的变化
    eventBus1.on(({ index, query }) => {
      if (index === 2) {
        searchQuery.value = query;
        console.log(`页面索引 ${index} 接收到搜索内容：`, query);
        if(query===''){
          goBackToParentFolder();
        }
        else{
          performSearch(query); // 根据新的搜索内容获取数据
        }

      }
    });
  });

  const previewContentfa = ref('');
  const selectedIds = computed(() => {
    return {
      files: favoriteFiles.value.filter(file => file.selected), // 选中的文件对象数组
      folders: favoriteFolders.value.filter(folder => folder.selected), // 选中的文件夹对象数组
    };
  });

  const isAnyFileSelected = computed(() => {
    console.log(favoriteFiles.value);

    return favoriteFiles.value.some(file => file.selected)||favoriteFolders.value.some(folder => folder.selected);
  });

  // 过滤出已收藏的文件
  // const favoriteFiles = computed(() => {
  //   return files.value.filter(file => file.Favorite);
  // });
  // const favoriteFolders = computed(() => {
  //   return folders.value.filter(folder => folder.isFavorite);
  // });
  onMounted(async () => {
    console.log(favoriteFiles.value);

    Stack.length = 0;
    const folder=await fetchFavoriteFolders(account,userData.data.token);
    const file=await fetchFavoriteFiles(account,userData.data.token);
    // const {folder, file}=await Promise.all([fetchFavoriteFolders(account,userData.data.token), fetchFavoriteFiles(account,userData.data.token)]);
    Stack.push([folder, file]);
    console.log("12",folder)
    folders.value=folder;
    files.value=file;
    console.log("enter",files.value);
    // favoriteFolders.value = Stack[Stack.length - 1][0];
    // favoriteFiles.value = Stack[Stack.length - 1][1];
  });
  // 组件加载时获取数据
  // onMounted(async () => {
  //   await Promise.all([fetchFavoriteFolders(), fetchFavoriteFiles()]);
  // });
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
    console.log('3',folders.value);
    // console.log("Stackfa:",Stackfa);
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

  //下载函数
  const handleBatchDownload= () => {
    downloadFile(account, selectedIds, token);
  }

  //预览函数
  const showPreviewModal = ref(false);
  const setPreviewContent = (url) => {
    previewContentfa.value = url; // 更新 previewContent
    //console.log("Updated previewContent:", previewContent.value);
  };
  const handlepreviewFile1=(account,fileID,token,event)=>{
    previewContentfa.value ='';
    showPreviewModal.value=true;
    handlepreviewFile(account,fileID,token,setPreviewContent,event);
  }
const isAllSelected = ref(false);
const selectAll = () => {
  isAllSelected.value = !isAllSelected.value;
  const newState = isAllSelected.value;
  [...files.value, ...folders.value].forEach(item => (item.selected = newState));
};
//  folders.value = folders.value.filter(folder => !selectedIds.value.folders.includes(folder));
// files.value = files.value.filter(folder => !selectedIds.value.files.includes(folder));
const cancleFavorite = () => {
  markAsFavorite(selectedIds, account, token, 1);
  folders.value = folders.value.filter(folder => !selectedIds.value.folders.includes(folder));
  files.value = files.value.filter(folder => !selectedIds.value.files.includes(folder));
};
</script>

<template>
  <div id="filebox">
    <div class="file_header">
      <p>我的收藏</p>
      <div id="alert-container"></div> <!-- 中间的label容器 -->
      <button id="allSelected" style="margin-right: 15px;" @click="selectAll">
        <img src="../assets/全选.svg" alt="" style="width: 30px; height: 30px;">
      </button>
      <button id="back" @click="goBackToParentFolder">
        <img src="../assets/回退.svg" alt="" style="width: 30px; height: 30px;">
      </button>
    </div>
    <div class="file_op">
      <div class="file-list">
        <div class="file-item" v-for="folder in folders" :key="folder.id">
          <img :src=folderURL alt="文件夹图标" class="file-icon" />
          <a href="" class="file-name"
             @click.prevent="getFolderFile(folder.id)"
             @mouseover="showFileOrFolderInfo(folder.id, 'folder', token, userInfo.account,$event)"
             @mouseout="hideFileOrFolderInfo"
             @click="hideFileOrFolderInfo">{{ folder.name }}</a> <!-- folder.FileName需要修改-->
          <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->
        </div>
        <div class="file-item" v-for="file in files" :key="file.ID">
          <img :src=fileURL alt="文件图标" class="file-icon" />
          <a href="" class="file-name"
             @mouseover="showFileOrFolderInfo(file.ID, 'file', token, userInfo.account,$event)"
             @mouseout="hideFileOrFolderInfo"
             @click.prevent="handlepreviewFile1(userInfo.account,file.ID,token,$event)">{{ file.FileName }}</a>
          <input type="checkbox" v-model="file.selected" class="file-checkbox" />
        </div>
      </div>
      <div class="file-operations" v-if="isAnyFileSelected">
        <button @click="handleBatchDownload"><img src="../assets/下载.svg" alt="">下载</button>
        <button @click="cancleFavorite"><img src="../assets/回收站.svg" alt="">取消收藏</button>

      </div>
    </div>

    <!-- 预览模态框 -->
    <div v-if="showPreviewModal" class="modalpre">
      <div class="modal-precontent">
        <button class="close-prebutton" @click="showPreviewModal = false">×</button>
        <h3 class="modal-pretitle">正在预览文件中…</h3>
        <div class="file-preview-area">
          <div v-if="isLoading" class="loading-container">
            <img src="@/assets/加载.svg" alt="Loading..." class="loading-image" />
          </div>
          <p v-if="!previewContentfa && !isLoading">该类型文件暂不支持预览</p>
          <p v-else-if="isLoading">正在加载中，请稍候...</p>
          <iframe v-else :src="previewContentfa"></iframe>
        </div>
      </div>
    </div>

    <!-- 显示悬停的文件/文件夹信息 -->
    <div v-if="fileOrFolderInfo.type==='folder'" class="info-popup" :style="{ top: popupTop, left: popupLeft }">
      <p>类型: {{ fileOrFolderInfo.type === 'folder' ? '文件夹' : '文件' }}</p>
      <p>名称: {{ fileOrFolderInfo.data.folder_name}}</p>
      <p>路径: {{ fileOrFolderInfo.data.path }}</p>
      <p>是否收藏: {{ fileOrFolderInfo.data.is_favorite ? '是' : '否' }}</p>
      <p>分享状态: {{ fileOrFolderInfo.data.is_share ? '已共享' : '未共享' }}</p>
    </div>
    <div v-if="fileOrFolderInfo.type==='file'" class="info-popup" :style="{ top: popupTop, left: popupLeft }">
      <p>类型: {{ fileOrFolderInfo.type === 'folder' ? '文件夹' : '文件' }}</p>
      <p>名称: {{ fileOrFolderInfo.data.FileName }}</p>
      <p>路径: {{ fileOrFolderInfo.data.Path }}</p>
      <p>上传时间: {{ fileOrFolderInfo.data.CreatedAt }}</p>
      <p>是否收藏: {{ fileOrFolderInfo.data.Favorite ? '是' : '否' }}</p>
      <p>分享状态: {{ fileOrFolderInfo.data.Share ? '已共享' : '未共享' }}</p>
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
  .info-popup {
    position: absolute;
    top: 50px; /* 距离父元素顶部50px */
    left: 100px; /* 距离父元素左侧100px */
    background: white;
    color: #474343;
    padding: 10px;
    border-radius: 15px;
    font-size: 14px;
    font-family: 宋体;
    z-index: 100; /* 确保它在前面 */
    display: block; /* 确保它可以显示 */
    font-weight: bold; /* 加粗字体 */
    border: 2px solid #423f3f; /* 设置边界线，宽度为2px，颜色为黑色 */
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

  /* 预览模态框 */
  .modalpre {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-precontent {
    position: relative;
    background: #fff;
    border-radius: 8px;
    min-width: 300px;
    min-height: 200px;
    width: 900px; /* 模态框固定宽度 */
    height: 600px; /* 模态框固定高度 */
    display: flex;
    flex-direction: column; /* 让内容垂直排列 */
    align-items: center;
  }

  .close-prebutton {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 30px;
    cursor: pointer;
  }

  .close-prebutton:hover {
    color: red;
  }

  .modal-pretitle {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 20px;
    font-weight: bold;
    margin: 0;
  }

  .file-preview-area {
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center;    /* 垂直居中 */
    width: 80%;
    height: 80%;
    margin: auto;           /* 如果需要内容居中，还可用 margin 调整 */
    background-color: #f5f5f5; /* 可选，设置背景色以便预览更清晰 */
    border: 1px solid #ccc;    /* 可选，添加边框样式 */
    overflow: hidden;          /* 防止内容溢出 */
  }

  .loading-container {
    position: absolute;
    top: 240px; /* 将图片定位在顶部 */
    left: 50%; /* 水平居中 */
    transform: translateX(-50%); /* 让图片在水平方向上真正居中 */
    margin-bottom: 10px;
  }

  .loading-image {
    width: 40px; /* 设置图片大小 */
    height: auto;
  }
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    margin: 90px;
    object-fit: contain; /* 确保内容适应容器 */
  }

</style>
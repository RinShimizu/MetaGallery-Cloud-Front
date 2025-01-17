<script setup>
import {ref, computed, onMounted} from 'vue';
  import fileURL from '../assets/文件.svg';
  import folderURL from '../assets/文件夹.svg';
import {
  fetchSubInfo,
  showFileOrFolderInfo, hideFileOrFolderInfo, fileOrFolderInfo, popupTop, popupLeft, searchInStar,
  downloadFile,//下载
  handlepreviewFile, isLoading, favoriteFiles, fetchFavoriteFolders, fetchFavoriteFiles//获取已收藏文件和文件夹
} from "@/homepage/api.js";
  import {useEventBus} from "@vueuse/core";

  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('userData'));
  var userInfo = userData.data.userInfo;
  var account=userInfo.account;
  let Stack = []; // 定义一个栈来存储，栈元素是一个二元组，第一个元素为文件夹，第二个元素为文件
  var files = ref([]);
  var folders = ref([]);

  const searchQuery = ref(""); // 当前搜索关键字
  const eventBus1 = useEventBus("search-update");
  const performSearch = (query) => {
    searchInStar(token, userInfo.account, query)
        .then(({ folder, file }) => {
          Stack.push([folder,file]);
          folders.value=folder;
          files.value=file;
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
      files: files.value.filter(file => file.selected), // 选中的文件对象数组
      folders: folders.value.filter(folder => folder.selected), // 选中的文件夹对象数组
    };
  });

  const isAnyFileSelected = computed(() => {
    var i=0,j=0;
    if(files.value)
      i=files.value.some(file => file.selected)
    if(folders.value)
      j=folders.value.some(folder => folder.selected);
    return i+j;
  });


  onMounted(async () => {

    Stack.length = 0;
    const folder=await fetchFavoriteFolders(account,userData.data.token);
    const file=await fetchFavoriteFiles(account,userData.data.token);
    Stack.push([folder, file]);
    folders.value=folder;
    files.value=file;
  });

  const getFolderFile = async (ID) => {
    await fetchSubInfo(Stack, userData.data.token, userInfo.account, ID);
    folders.value = Stack[Stack.length - 1][0];
    files.value = Stack[Stack.length - 1][1];
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
  if(files.value)
    files.value.forEach(item => (item.selected = newState));
  if(folders.value)
    folders.value.forEach(item => (item.selected = newState));
};

</script>

<template>
  <div id="filebox">
    <div class="file_header">
      <p>我的收藏</p>
      <div id="alert-container"></div> <!-- 中间的label容器 -->
      <div class="header-buttons">
        <button id="allSelected" @click="selectAll">
          <img src="../assets/全选.svg" alt="" style="width: 30px; height: 30px;">
        </button>
        <button id="back" @click="goBackToParentFolder">
          <img src="../assets/回退.svg" alt="" style="width: 30px; height: 30px;">
        </button>
      </div>
    </div>
    <div class="file_op">
      <div class="file-list">
        <div class="file-item" v-for="folder in folders" :key="folder.id"
             @click="getFolderFile(folder.id);hideFileOrFolderInfo()"
             @mouseover="(e) => {
                  showFileOrFolderInfo(folder.id, 'folder', token, userInfo.account, {
                    clientX: e.clientX + 260,
                    clientY: e.clientY + 70
                  });
                }"
             @mouseout="hideFileOrFolderInfo">
          <img :src=folderURL alt="文件夹图标" class="file-icon" />
          <span class="file-name">{{ folder.name }}</span> <!-- folder.FileName需要修改-->
          <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->
        </div>
        <div class="file-item" v-for="file in files" :key="file.ID"
             @mouseover="(e) => {
                  showFileOrFolderInfo(file.ID, 'file', token, userInfo.account, {
                    clientX: e.clientX + 260,
                    clientY: e.clientY + 70
                  });
                }"
             @mouseout="hideFileOrFolderInfo"
             @click="handlepreviewFile1(userInfo.account,file.ID,token,$event);hideFileOrFolderInfo()">
          <img :src=fileURL alt="文件图标" class="file-icon" />
          <span class="file-name">{{ file.FileName }}</span>
          <input type="checkbox" v-model="file.selected" class="file-checkbox" @click.stop/>
        </div>
      </div>
      <div class="file-operations" v-if="isAnyFileSelected">
        <button @click="handleBatchDownload"><img src="../assets/下载.svg" alt="">下载</button>
      </div>
    </div>

    <!-- 预览模态框 -->
    <div v-if="showPreviewModal" class="modalpre">
      <div class="modal-precontent">
        <div class="modal-header">
          <h3>文件预览</h3>
          <button class="close-prebutton" @click="showPreviewModal = false">×</button>
        </div>
        <div class="preview-container">
          <div v-if="isLoading" class="loading-container">
            <img src="@/assets/加载.svg" alt="Loading..." class="loading-image" />
            <span>正在加载中，请稍候...</span>
          </div>
          <div v-else-if="!previewContentfa" class="no-preview">
            <p>该类型文件暂不支持预览</p>
          </div>
          <iframe v-else :src="previewContentfa" class="preview-iframe"></iframe>
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
/* 整体容器样式优化 */
#filebox {
  padding: 20px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

/* 头部区域美化 */
.file_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  margin-bottom: 15px;
}

.file_header p {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 头部按钮组 */
.header-buttons {
  display: flex;
  align-items: center;
  gap: 12px;  /* 按钮之间的间距 */
}

/* 按钮样式美化 */
#allSelected, #back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;  /* 统一按钮大小 */
  height: 36px;
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

#allSelected img, #back img {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

#allSelected:hover, #back:hover {
  background: rgba(64, 149, 229, 0.1);
}

#allSelected:hover img, #back:hover img {
  opacity: 1;
}

/* 文件操作区域美化 */
.file_op {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 15px;
  display: flex;
  flex-direction: column;
}

/* 文件列表美化 */
.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

/* 滚动条美化 */
.file-list::-webkit-scrollbar {
  width: 8px;
}

.file-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.file-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.file-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}
/* 文件项样式美化 */
.file-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;  /* 增加内边距 */
  margin: 8px 0;  /* 增加项目间距 */
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  cursor: pointer;
  height: 35px;  /* 增加高度 */
  gap: 16px;  /* 统一设置元素间距 */
}

.file-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.file-icon {
  width: 24px;  /* 加大文件图标 */
  height: 24px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-right: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-left: auto;
}

/* 文件操作按钮组 */
.file-operations {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
  margin-top: auto;
  border-top: 1px solid #eee;
}

.file-operations button {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 20px;
  border: none;
  border-radius: 8px;
  background: #f5f7fa;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-operations button img {
  width: 20px;
  height: 20px;
  opacity: 0.8;
}

/* 悬浮框样式 */
.info-popup {
  position: fixed;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 250px;
  font-size: 14px;
  line-height: 1.6;
  pointer-events: none;
}

/* 预览模态框样式 */
.modalpre {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-precontent {
  width: 90vw;
  height: 90vh;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-prebutton {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-prebutton:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.preview-container {
  flex: 1;
  position: relative;
  background: #f8f9fa;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* 移除外层滚动条 */
}

.preview-iframe {
  width: 95%; /* 稍微缩小一点，留出边距 */
  height: 95%;
  border: none;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: auto; /* 只在 iframe 内部显示滚动条 */
}

/* 美化 iframe 的滚动条 */
.preview-iframe::-webkit-scrollbar {
  width: 8px;
  height: 8px; /* 添加水平滚动条的高度 */
}

.preview-iframe::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.preview-iframe::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.preview-iframe::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-image {
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-container span {
  color: #666;
  font-size: 14px;
}

.no-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
<script setup>
import {ref, computed, onMounted, toRaw} from 'vue';
import fileURL from '../assets/文件.svg';
import folderURL from '../assets/文件夹.svg';
import {useEventBus} from "@vueuse/core";
import {
  fetchSharedInfo, fetchShareSubInfo, searchInShare,
  showLabelAlert,
  unShareItems,
  downloadSharedFile
} from "@/homepage/api.js";


const token = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData'));
var userInfo = userData.data.userInfo;
var account = userInfo.account;
const isLoading = ref(false); // 添加加载状态变量
const isAllSelected = ref(false);
let Stack = []; // 定义一个栈来存储，栈元素是一个二元组，第一个元素为文件夹，第二个元素为文件
//获取当前页面文件夹和文件
var folders = ref([]);
var files = ref([]);

var currentFolderName='root';

const searchQuery = ref(""); // 当前搜索关键字
const eventBus1 = useEventBus("search-update");
const performSearch = (query) => {
  console.log(query);
  searchInShare(token, userInfo.account, query)
      .then(({ folder, file }) => {
        folders.value=folder;
        files.value=file;
        Stack.push([toRaw(folders.value), toRaw(files.value)]);
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
    if (index === 1) {
      searchQuery.value = query;
      console.log(`页面索引 ${index} 接收到搜索内容：`, query);
      if(query===''){
        goBackToParentShareFolder();
      }
      else{
        performSearch(query); // 根据新的搜索内容获取数据
      }

    }
  });
});

onMounted(async () => {
  Stack.length = 0;
  const folderData = await fetchSharedInfo(token, account);
  folders.value = folderData.map(folder => ({
    ...folder,
    selected: false, // 添加 `selected` 属性
  }));
  Stack.push([toRaw(folders.value), toRaw(files.value)]);
  console.log("folders_shared",folders.value);
})

const selectedIds = computed(() => {
  return {
    files: files.value.filter(file => file.selected), // 选中的文件对象数组
    folders: folders.value.filter(folder => folder.selected), // 选中的文件夹对象数组
  };
});

const isAnyFileSelected = computed(() => {
  return (
      (files.value && files.value.some(file => file.selected)) ||
      (folders.value && folders.value.some(folder => folder.selected))
  );
});


const isMultipleSelected = computed(() => {
  // 计算总选中数量
  const totalSelected = selectedIds.value.files.length + selectedIds.value.folders.length;
  return totalSelected > 1; // 如果总选中数量大于 1，返回 true
});

const selectAll = () => {
  isAllSelected.value = !isAllSelected.value;
  const newState = isAllSelected.value;
  if(files.value)
    files.value.forEach(item => (item.selected = newState));
  if(folders.value)
    folders.value.forEach(item => (item.selected = newState));
};

const enterFolder = async (folder) => {
  isLoading.value = true;
  currentFolderName=folder.folder_name;
  console.log("curPathName:" + currentFolderName);
  console.log(folder)
  // 调用 API 获取子文件夹和文件
  const { subfolders, file } = await fetchShareSubInfo(userData.data.token, userInfo.account, userInfo.account, currentFolderName, folder.ipfs_hash);
  console.log('f',subfolders);
  // 更新 folders 和 files 的值
  folders.value = subfolders;
  files.value = file;
  Stack.push([toRaw(folders.value), toRaw(files.value)]);
  isLoading.value = false;
}

const goBackToParentShareFolder=()=>{
  if(Stack.length > 1){
    console.log("Stack",Stack)
    Stack.pop();
    console.log("Stack",Stack)
    folders.value = Stack[Stack.length - 1][0];
    files.value = Stack[Stack.length - 1][1];
    console.log("goback",folders.value);
  }
  else{
    showLabelAlert('当前目录为系统默认目录');
  }
}


const showUnshareModal = ref(false); // 控制模态框显示的状态

// 确认删除
const confirmUnshare = () => {
  console.log(selectedIds);
  unShareItems(selectedIds,token,account)
      .then(result => {
        showLabelAlert(result);// 输出 "删除成功" 或 "删除失败: 错误信息"
      })
      .catch(error => {
        console.error('取消共享时发生错误:', error);
      });
  folders.value = folders.value.filter(folder => !selectedIds.value.folders.includes(folder));
  showUnshareModal.value = false; // 关闭模态框
};

// 取消删除
const cancelUnshare = () => {
  showUnshareModal.value = false; // 关闭模态框
};

const cancelShare=()=>{
  showUnshareModal.value = true;
}

//下载函数
const downloadSharedFiles=()=>{
  const folders=selectedIds.value.folders;
  const files=selectedIds.value.files;
  // 检查是否有选中的文件夹
  if (folders.length>0) {
    alert('不允许下载文件夹！');
    return;  // 如果有文件夹，终止下载
  }
  files.forEach(file => {
    const filename=file.file_name;
    // console.log("filename",filename);
    // console.log("file.ipfs_hash",file.cid);
    downloadSharedFile(account,filename,file.cid, token);
  });
}

</script>

<template>
  <div id="filebox">
    <div class="file_header">
      <p>我的共享</p>
      <div id="alert-container"></div> <!-- 中间的label容器 -->
      <div class="header-buttons">
        <button id="allSelected" @click="selectAll">
          <img src="../assets/全选.svg" alt="" style="width: 30px; height: 30px;">
        </button>
        <button id="back" @click="goBackToParentShareFolder">
          <img src="../assets/回退.svg" alt="" style="width: 30px; height: 30px;">
        </button>
      </div>
    </div>
    <div class="file_op">
      <div v-if="isLoading" class="global-loading">
        <div class="loading-spinner"></div>
      </div>
      <template v-else>
        <div class="file-list">
          <!-- 文件夹列表 -->
          <div class="folder-item" v-for="(folder, index) in folders"  :key="'folder-' + index"
               @click.prevent="enterFolder(folder)">
            <img :src=folderURL alt="文件夹图标" class="file-icon" />
            <span class="file-name">{{ folder.folder_name }}</span>
            <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->
          </div>
          <div class="file-item" v-for="file in files" :key="file.ID">
            <img :src="fileURL" alt="文件图标" class="file-icon" />
            <span class="file-name">{{ file.file_name }}</span>
            <input type="checkbox" v-model="file.selected" class="file-checkbox" />
          </div>
        </div>
        <div class="file-operations" v-if="isAnyFileSelected">
          <button @click="downloadSharedFiles"><img src="../assets/下载.svg" alt="">下载</button>
          <button @click="cancelShare"><img src="../assets/取消.svg" alt="">取消共享</button>
        </div>
      </template>

    </div>
    <!-- 删除确认模态框 -->
    <div v-if="showUnshareModal" class="modal">
      <div class="modal-content">
        <h3>确定取消共享该文件夹吗？</h3>
        <p>选中的文件夹取消共享后将无法恢复</p>
        <button id="btn1" @click="confirmUnshare">确 定</button>
        <button id="btn2" @click="cancelUnshare">取 消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

/* 文件项样式美化 */
.folder-item, .file-item {
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

/* 悬浮和选中状态 */
.folder-item:hover, .file-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* 文件图标样式 */
.file-icon {
  width: 24px;  /* 加大文件图标 */
  height: 24px;
  flex-shrink: 0;
}

/* 文件名称样式 */
.file-name {
  flex: 1;
  font-size: 16px;  /* 加大字体 */
  color: #333;
  font-weight: 500;  /* 稍微加粗 */
  margin-right: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 复选框样式调整 */
.file-checkbox {
  width: 18px;  /* 稍微加大复选框 */
  height: 18px;
  cursor: pointer;
  margin-left: auto;
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

/* 文件操作按钮组 */
.file-operations {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;  /* 增加按钮之间的间距 */
  padding: 20px 0;  /* 增加上下内边距 */
  margin-top: auto;
  border-top: 1px solid #eee;
}

.file-operations button {
  display: flex;
  align-items: center;
  gap: 10px;  /* 增加图标和文字的间距 */
  height: 42px;  /* 增加按钮高度 */
  padding: 0 20px;  /* 增加左右内边距 */
  border: none;
  border-radius: 8px;
  background: #f5f7fa;
  color: #333;
  font-size: 15px;  /* 增加字体大小 */
  font-weight: 500;  /* 加粗字体 */
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-operations button img {
  width: 20px;  /* 增加图标大小 */
  height: 20px;
  opacity: 0.8;
}


.file-operations button:hover:not(:disabled) {
  background: #e9ecef;
  transform: translateY(-1px);
}

.file-operations button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f0f2f5;
}

.file-operations button:hover:not(:disabled) img {
  opacity: 1;
}

/* 特殊按钮样式 */
.file-operations button.primary {
  background: #4095E5;
  color: white;
}

.file-operations button.primary:hover:not(:disabled) {
  background: #3084d4;
  box-shadow: 0 2px 8px rgba(64, 149, 229, 0.2);
}

.file-operations button.danger {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.file-operations button.danger:hover:not(:disabled) {
  background: rgba(220, 53, 69, 0.15);
}


  /* alert-container 样式 */
#alert-container {
  flex: 1; /* 让其占据可用空间 */
  text-align: center; /* 文本居中 */
}


  /* 模态框样式 */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
  }
  .modal-content h3{
    margin-bottom: 10px;
  }
  .modal-content p{
    color: gray;
    margin-top: 0;
    margin-bottom: 30px;
  }

  #btn1{
    position: relative;
    vertical-align: middle;
    height: 40px;
    width: 120px;
    font-size: 15px;
    background-color: #4095E5;
    color: white;
    border-radius: 5%;
    border: 1px solid #4095E5;
    transition-duration: 0.2s;
    margin: auto 30px;
  }
  #btn2{
    position: relative;
    vertical-align: middle;
    height: 40px;
    width: 120px;
    font-size: 15px;
    background-color: white;
    color: gray;
    border-radius: 5%;
    border: 1px solid gray;
    transition-duration: 0.2s;
    margin: auto 30px;
  }
  #btn1:hover{
    background-color: white;
    color: #4095E5;
    border: 1px solid #4095E5;

  }
  #btn2:hover{
    color: black;
    border: 1px solid black;
  }


/* 加载状态 */
.global-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4095E5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
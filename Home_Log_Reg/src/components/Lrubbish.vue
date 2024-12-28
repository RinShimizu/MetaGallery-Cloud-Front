<script setup>
import {ref, computed, onMounted} from 'vue';
import fileURL from '../assets/文件.svg';
import folderURL from '../assets/文件夹.svg';
import {
  fetchDelSubInfo,
  recoverItems,
  showLabelAlert,
  completeDeleteItems,
  searchInCan,
  showBinFileOrFolderInfo,
  hideBinFileOrFolderInfo,
  fileOrFolderInfo,
  popupTop,
  popupLeft,
  showFileOrFolderInfo,
  hideFileOrFolderInfo
} from "@/homepage/api.js";
import { useEventBus } from "@vueuse/core";

//用户信息加载,不要重复写
//包括name,account,avatar,intro,token(这个在userdata里，别的在userinfo里)
const userData = JSON.parse(localStorage.getItem('userData'));
var userInfo = userData.data.userInfo;

let Stack = []; // 定义一个栈来存储，栈元素是一个二元组，第一个元素为文件夹，第二个元素为文件
const eventBus = useEventBus("folder-update");
const token = localStorage.getItem('token');
const isAllSelected = ref(false);


//获取当前页面文件夹和文件
var folders = ref([]);
var files = ref([]);
const showRecoverModal = ref(false); // 控制模态框显示的状态
const showDeleteModal = ref(false); // 控制模态框显示的状态

const searchQuery = ref(""); // 当前搜索关键字
const eventBus1 = useEventBus("search-update");
const performSearch = (query) => {
  console.log(query);
  searchInCan(token, userInfo.account, query)
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
    if (index === 4) {
      searchQuery.value = query;
      console.log(`页面索引 ${index} 接收到搜索内容：`, query);
      if(query===''){
        Stack.pop();
        folders.value = Stack[Stack.length - 1][0];
        files.value = Stack[Stack.length - 1][1];
      }
      else{
        performSearch(query); // 根据新的搜索内容获取数据
      }

    }
  });
});

onMounted(async () => {
  Stack.length = 0;
  await fetchDelSubInfo(Stack, token, userInfo.account);
  folders.value = Stack[Stack.length - 1][0];
  files.value = Stack[Stack.length - 1][1];
  console.log(Stack);
})

const selectedIds = computed(() => {
  return {
    files: files.value.filter(file => file.selected), // 选中的文件对象数组
    folders: folders.value.filter(folder => folder.selected), // 选中的文件夹对象数组
  };
});

const isAnyFileSelected = computed(() => {
  return files.value.some(file => file.selected)||folders.value.some(folder => folder.selected);
});

const selectAll = () => {
  isAllSelected.value = !isAllSelected.value;
  const newState = isAllSelected.value;
  if(files.value)
    files.value.forEach(item => (item.selected = newState));
  if(folders.value)
    folders.value.forEach(item => (item.selected = newState));
};

const confirmRecover = () => {
  console.log(selectedIds);
  recoverItems(selectedIds, token, userInfo.account)
      .then(result => {
        showLabelAlert(result);// 输出 "删除成功" 或 "删除失败: 错误信息"
      })
      .catch(error => {
        console.error('处理恢复结果时发生错误:', error);
      });
  folders.value = folders.value.filter(folder => !selectedIds.value.folders.includes(folder));
  files.value = files.value.filter(folder => !selectedIds.value.files.includes(folder));
  showRecoverModal.value = false; // 关闭模态框
};

const cancelRecover = () => {
  showRecoverModal.value = false; // 关闭模态框
};

const clickRecover = () => {
  // 显示模态框而不是直接删除
  showRecoverModal.value = true;
};

const confirmDelete = () => {
  console.log(selectedIds);
  completeDeleteItems(selectedIds, token, userInfo.account)
      .then(result => {
        showLabelAlert(result);// 输出 "删除成功" 或 "删除失败: 错误信息"
      })
      .catch(error => {
        console.error('处理删除结果时发生错误:', error);
      });
  folders.value = folders.value.filter(folder => !selectedIds.value.folders.includes(folder));
  files.value = files.value.filter(folder => !selectedIds.value.files.includes(folder));
  showDeleteModal.value = false; // 关闭模态框
}

const cancelDelete = () => {
  showDeleteModal.value = false; // 关闭模态框
};

const clickDelete = () => {
  // 显示模态框而不是直接删除
  showDeleteModal.value = true;
};
</script>

<template>
  <div id="filebox">
    <div class="file_header">
      <p>回收站</p>
      <div id="alert-container"></div> <!-- 中间的label容器 -->
      <div class="header-buttons">
        <button id="allSelected" @click="selectAll">
          <img src="../assets/全选.svg" alt="" style="width: 30px; height: 30px;">
        </button>
      </div>
    </div>
    <div class="file_op">
      <div class="file-list">
        <!-- 文件夹列表 -->
        <div class="folder-item" v-for="folder in folders" :key="folder.id"
             @mouseover="(e) => {
                  showBinFileOrFolderInfo(folder.bin_id,folder.id, 'folder', token, userInfo.account, {
                    clientX: e.clientX + 260,
                    clientY: e.clientY + 70
                  });
                }"
             @mouseout="hideBinFileOrFolderInfo">
          <img :src=folderURL alt="文件夹图标" class="file-icon" />
            <span class="file-name">{{ folder.folder_name }}</span>
            <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->
        </div>
        <div class="file-item" v-for="file in files" :key="file.ID"
             @mouseover="(e) => {
                  showBinFileOrFolderInfo(1,file.ID, 'file', token, userInfo.account,{
                    clientX: e.clientX + 260,
                    clientY: e.clientY + 70
                  });
                }"
             @mouseout="hideBinFileOrFolderInfo">
          <img :src="fileURL" alt="文件图标" class="file-icon" />
          <span class="file-name"
                @mouseover="showBinFileOrFolderInfo(1,file.ID, 'file', token, userInfo.account,$event)"
                @mouseout="hideBinFileOrFolderInfo">{{ file.FileName }}</span>
          <input type="checkbox" v-model="file.selected" class="file-checkbox" />
        </div>
      </div>
      <div class="file-operations" v-if="isAnyFileSelected">
        <button @click="clickRecover"><img src="../assets/恢复.svg" alt="">恢复</button>
        <button @click="clickDelete"><img src="../assets/回收站.svg" alt="">删除</button>
      </div>
    </div>
    <div v-if="showRecoverModal" class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h3>恢复文件</h3>
          <button class="close-button" @click="cancelRecover">×</button>
        </div>

        <div class="modal-body">
          <img src="../assets/恢复.svg" alt="恢复" class="modal-icon">
          <p class="warning-text">确定恢复选中的文件（夹）？</p>
          <p class="tip-text">您可以在文件列表中查看恢复的文件（夹）</p>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" @click="cancelRecover">取消</button>
          <button class="confirm-button recover" @click="confirmRecover">恢复</button>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h3>永久删除</h3>
          <button class="close-button" @click="cancelDelete">×</button>
        </div>

        <div class="modal-body">
          <img src="../assets/回收站.svg" alt="删除" class="modal-icon">
          <p class="warning-text">确定彻底删除选中的文件（夹）？</p>
          <p class="tip-text">彻底删除后，你将无法找回该文件（夹）</p>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" @click="cancelDelete">取消</button>
          <button class="confirm-button delete" @click="confirmDelete">删除</button>
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
#allSelected{
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

#allSelected img{
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

#allSelected:hover{
  background: rgba(64, 149, 229, 0.1);
}

#allSelected:hover img{
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

/* 文件图标样式 */
.file-icon {
  width: 24px;  /* 加大文件图标 */
  height: 24px;
  flex-shrink: 0;
}

/* 复选框样式调整 */
.file-checkbox {
  width: 18px;  /* 稍微加大复选框 */
  height: 18px;
  cursor: pointer;
  margin-left: auto;
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

/* 弹窗样式美化 */
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

.info-popup p {
  margin: 8px 0;
}

.info-popup p:first-child {
  margin-top: 0;
}

.info-popup p:last-child {
  margin-bottom: 0;
}

/* alert-container 样式 */
#alert-container {
  flex: 1; /* 让其占据可用空间 */
  text-align: center; /* 文本居中 */
}


/* 模态框样式 */
.modal-wrapper {
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

.modal-content {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-button {
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

.close-button:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.modal-body {
  padding: 30px 20px;
  text-align: center;
}

.modal-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.warning-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.tip-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.modal-footer {
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button,
.confirm-button {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button {
  border: 1px solid #ddd;
  background: white;
  color: #666;
}

.confirm-button {
  border: none;
  color: white;
}

.confirm-button.recover {
  background: #4095E5;
}

.confirm-button.delete {
  background: #dc3545;
}

.cancel-button:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.confirm-button.recover:hover {
  background: #3084d4;
}

.confirm-button.delete:hover {
  background: #c82333;
}
</style>
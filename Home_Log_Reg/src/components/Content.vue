<script setup>
import {computed, ref, onMounted, toRaw} from "vue";
import {useRoute} from 'vue-router';
import {downloadSharedFile, fetchShareSubInfo, showLabelAlert} from "@/homepage/api.js";
import fileURL from "@/assets/文件.svg";
import folderURL from "@/assets/文件夹.svg";

let Stack = [];
const route = useRoute();
const item = ref(null);
const folders = ref([]);
const files = ref([]);
const isLoading1 = ref(true); // 添加加载状态变量
const isLoading2 = ref(false); // 添加加载状态变量
const token = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData'));
var userInfo = userData.data.userInfo;
var currentFolderName='root';

onMounted(() => {
  Stack.length = 0;
  if (route.query.item) {
    try {
      item.value = JSON.parse(route.query.item);
      // 设置加载状态为 true
      isLoading1.value = true;
      fetchShareSubInfo(token, userInfo.account, item.value.owner_account.account, item.value.folder_name, item.value.ipfs_hash)
          .then(data => {
            Stack.push([data.subfolders,data.file]);
            console.log(Stack);
            folders.value = Stack[Stack.length - 1][0];
            files.value = Stack[Stack.length - 1][1];
            console.log(files.value);
          })
          .catch(error => {
            console.error('Failed to fetch share sub info:', error);
          })
          .finally(() => {
            // 无论成功或失败，都将加载状态设置为 false
            isLoading1.value = false;
          });
    } catch (error) {
      console.error('Failed to parse item:', error);
      isLoading1.value = false; // 确保在解析失败时也设置加载状态为 false
    }
  } else {
    console.log('No item in query');
    isLoading1.value = false; // 没有 item 时也设置加载状态为 false
  }
});

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
  isLoading2.value = true; // 开始加载时设置为 true
  currentFolderName = folder.folder_name;
  console.log(folder)
  console.log("curPathName:" + currentFolderName);
  const { subfolders, file } = await fetchShareSubInfo(userData.data.token, userInfo.account, userInfo.account, currentFolderName, folder.ipfs_hash);
  console.log('f', subfolders,file);
  // 更新 folders 和 files 的值
  folders.value = subfolders;
  files.value = file;
  Stack.push([toRaw(folders.value), toRaw(files.value)]);
  isLoading2.value = false; // 无论成功或失败，都将加载状态设置为 false
  console.log(isLoading2.value)
}

const goBackToParentShareFolder = () => {
  if (Stack.length > 1) {
    console.log("Stack", Stack);
    Stack.pop();
    console.log("Stack", Stack);
    folders.value = Stack[Stack.length - 1][0];
    files.value = Stack[Stack.length - 1][1];
    console.log("goback", folders.value);
  } else {
    showLabelAlert('当前目录为系统默认目录');
  }
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
    downloadSharedFile(item.value.owner_account.account,filename,file.cid, token);
  });
}
</script>

<template>
  <div id="content_box">
    <div class="header">
      <router-link to="/gallery" class="back-button">
        <img src="../assets/回退.svg" alt="返回">
        <span>返回画廊</span>
      </router-link>
      <!-- 返回上级按钮 -->
      <div v-if="Stack.length > 1" class="back-to-parent" @click="goBackToParentShareFolder">
        <img src="../assets/返回.svg" alt="返回上级">
        <span>返回上级目录</span>
      </div>
    </div>

    <div class="content-wrapper">
      <div v-if="!isLoading1" class="main-content">
        <!-- 左侧内容区 -->
        <div class="left-panel">
          <!-- 文件夹简介 -->
          <div class="folder-intro">
            <h2>文件简介</h2>
            <p >{{ item?.intro || '暂无简介' }}</p>
          </div>

          <!-- 文件列表区域 -->
          <div class="file-container">


            <!-- 文件列表和下载按钮的容器 -->
            <div class="file-list-container">
              <!-- 文件列表区域 -->
              <div class="file-list">
                <!-- 加载状态 -->
                <div v-if="isLoading2" class="list-loading">
                  <div class="loading-spinner"></div>
                  <span>加载中...</span>
                </div>
                
                <!-- 文件列表内容 -->
                <template v-else>
                  <!-- 文件夹列表 -->
                  <div v-for="folder in folders"
                       :key="folder.id"
                       class="list-item folder-item"
                       @click="enterFolder(folder)">
                    <img :src="folderURL" alt="文件夹">
                    <span class="item-name">{{ folder.folder_name }}</span>
                    <input type="checkbox"
                           v-model="folder.selected"
                           class="item-checkbox"
                           @click.stop>
                  </div>

                  <!-- 文件列表 -->
                  <div v-for="file in files"
                       :key="file.ID"
                       class="list-item file-item">
                    <img :src="fileURL" alt="文件">
                    <span class="item-name">{{ file.file_name }}</span>
                    <input type="checkbox"
                           v-model="file.selected"
                           class="item-checkbox">
                  </div>
                </template>
              </div>

              <!-- 修改操作按钮区域 -->
              <div v-if="files && files.length > 0" class="file-actions">
                <div class="selected-info">
                  <span>已选择 {{ selectedIds.files.length }} 个文件</span>
                </div>
                <div class="action-buttons">
                  <button @click="downloadSharedFiles"
                          class="action-button download"
                          :disabled="!isAnyFileSelected || selectedIds.folders.length > 0">
                    <img src="../assets/下载.svg" alt="下载">
                    <span>下载选中文件</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧用户信息 -->
        <div class="right-panel">
          <!-- 添加文件夹封面 -->
          <div class="folder-cover">
            <img :src="item?.cover_img" alt="文件夹封面">
          </div>

          <!-- 原有的用户卡片 -->
          <div class="user-card">
            <div class="user-header">
              <img :src="item?.owner_account?.avatar" alt="用户头像" class="user-avatar">
              <div class="user-basic">
                <h3>{{ item?.owner_account?.name }}</h3>
                <span class="user-account">@{{ item?.owner_account?.account }}</span>
              </div>
            </div>

            <div class="user-intro">
              <h4>个人简介</h4>
              <p>{{ item?.owner_account?.intro || '这个用户很懒，什么都没写~' }}</p>
            </div>

            <div class="folder-info">
              <h4>文件夹信息</h4>
              <div class="info-item">
                <span class="label">文件夹名称</span>
                <span class="value">{{ item?.folder_name }}</span>
              </div>
              <div class="info-item">
                <span class="label">创建时间</span>
                <span class="value">{{ new Date(item?.pin_date).toLocaleDateString() }}</span>
              </div>
              <div class="info-item">
                <span class="label">文件数量</span>
                <span class="value">{{ files?.length || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全局加载状态 -->
      <div v-else class="global-loading">
        <div class="loading-spinner"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#content_box {
  padding: 24px;
  height: calc(100vh - 60px);
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 头部样式 */
.header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-button, .back-to-parent {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4095E5;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.back-button:hover, .back-to-parent:hover {
  background: #3084d4;
  transform: translateY(-1px);
}

.back-button img, .back-to-parent img {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

.folder-title h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

/* 主要内容区域 */
.content-wrapper {
  position: relative;
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.main-content {
  display: flex;
  height: 100%;
}

/* 左侧面板 */
.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-right: 1px solid #eee;
}

.folder-intro {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.folder-intro h2 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.folder-intro p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  font-family: 幼圆;
}

.file-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.file-list {
  position: relative; /* 添加相对定位 */
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;  /* 增加内边距 */
  margin: 8px 0;  /* 增加项目间距 */
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  cursor: pointer;
  height: 25px;  /* 增加高度 */
  gap: 16px;  /* 统一设置元素间距 */
}

.list-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.list-item img {
  width: 24px;  /* 加大文件图标 */
  height: 24px;
  flex-shrink: 0;
}

.item-name {
  flex: 1;
  font-size: 14px;  /* 加大字体 */
  color: #333;
  font-weight: 500;  /* 稍微加粗 */
  margin-right: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-checkbox {
  width: 16px;
  height: 16px;
}

/* 文件操作区域样式 */
.file-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  margin-top: auto; /* 确保按钮固定在底部 */
}

.selected-info {
  font-size: 14px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-button.download {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background: #4095E5;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.download:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.action-button.download:not(:disabled):hover {
  background: #3084d4;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 149, 229, 0.2);
}

.action-button.download img {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

/* 美化滚动条 */
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

/* 右侧面板 */
.right-panel {
  width: 320px;
  padding: 24px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 添加文件夹封面样式 */
.folder-cover {
  width: 100%;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  background: white;
}

.folder-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.folder-cover:hover img {
  transform: scale(1.05);
}

.user-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.user-header {
  padding: 24px;
  background: linear-gradient(135deg, #4095E5, #2d7bc0);
  color: white;
  text-align: center;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 16px;
  object-fit: cover;
}

.user-basic h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.user-account {
  font-size: 14px;
  opacity: 0.9;
}

.user-intro {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.user-intro h4,
.folder-info h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.user-intro p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.folder-info {
  padding: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #666;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}

/* 添加一些动画效果 */
.user-card {
  transition: transform 0.3s ease;
}

.user-card:hover {
  transform: translateY(-2px);
}

.user-avatar {
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

/* 加载状态 */
.global-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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

/* 修改加载状态的样式 */
.list-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  gap: 12px;
  z-index: 10;
}

.list-loading .loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4095E5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.list-loading span {
  color: #666;
  font-size: 14px;
}
</style>
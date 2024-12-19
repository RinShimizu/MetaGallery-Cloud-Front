<script setup>
import {computed, ref, onMounted} from "vue";
import {useRoute} from 'vue-router';
import {fetchShareSubInfo} from "@/homepage/api.js";
import fileURL from "@/assets/文件.svg";
import folderURL from "@/assets/文件夹.svg";

const route = useRoute();
const item = ref(null);
const folders = ref([]);
const files = ref([]);
const isLoading = ref(true); // 添加加载状态变量
const token = localStorage.getItem('token');

onMounted(() => {
  if (route.query.item) {
    try {
      item.value = JSON.parse(route.query.item);
      console.log(item.value);
      // 设置加载状态为 true
      isLoading.value = true;
      fetchShareSubInfo(token, item.value.owner_account.account, item.value.folder_name, item.value.ipfs_hash)
          .then(data => {
            folders.value = data.subfolders;
            files.value = data.file;
            console.log(files.value);
          })
          .catch(error => {
            console.error('Failed to fetch share sub info:', error);
          })
          .finally(() => {
            // 无论成功或失败，都将加载状态设置为 false
            isLoading.value = false;
          });
    } catch (error) {
      console.error('Failed to parse item:', error);
      isLoading.value = false; // 确保在解析失败时也设置加载状态为 false
    }
  } else {
    console.log('No item in query');
    isLoading.value = false; // 没有 item 时也设置加载状态为 false
  }
});

const isAnyFileSelected = computed(() => {
  return files.value.some(file => file.selected);
});
</script>

<template>
  <div id="content_box">
    <router-link to="/gallery">
      <p id="link">返回画廊</p>
    </router-link>
    <div style="position: relative; margin: 0 30px 20px 30px; width: 100%; height: 90%; border: #cccccc 1px solid; border-radius: 20px; display: flex;">
      <div class="details" v-if="!isLoading">
        <div class="file">
          <div class="induct">
            <h2 class="induct-title">文件简介</h2>
            <p class="induct-content">
              <span>{{ item.intro }}</span>
            </p>
          </div>
          <div class="file-list" >
            <div class="folder-item" v-for="(folder, index) in folders" :key="'folder-' + index">
              <img :src="folderURL" alt="文件夹图标" class="file-icon" />
              <span class="file-name" @click.prevent="enterFolder(folder)">{{ folder.folder_name }}</span>
              <input type="checkbox" v-model="folder.selected" class="file-checkbox" @click.stop /> <!-- 文件夹复选框 -->
            </div>
            <div class="file-item" v-for="file in files" :key="file.ID">
              <img :src="fileURL" alt="文件图标" class="file-icon" />
              <span class="file-name">{{ file.file_name }}</span>
              <input type="checkbox" v-model="file.selected" class="file-checkbox" />
            </div>
          </div>
          <div class="file-operations" v-if="isAnyFileSelected && !isLoading">
            <button><img src="../assets/下载.svg" alt="">下载</button>
            <button><img src="../assets/展开.svg" alt="">转存</button>
            <button><img src="../assets/收藏.svg" alt="">收藏</button>
          </div>
        </div>
        <div class="info">
          <div class="user-profile">
            <img :src="item?.owner_account?.avatar" alt="用户头像" class="avatar">
            <div class="user-details">
              <h3 class="username">{{ item?.owner_account?.account }}</h3>
              <p class="user-intro">{{ item?.owner_account?.intro }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="loading-spinner" v-else></div>
    </div>
  </div>
</template>

<style scoped>
/* 调整文件区域布局 */
.file {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: calc(100% - 40px); /* 减去上下padding */
  box-sizing: border-box;
}

/* 调整文件介绍区域 */
.induct {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  min-height: 120px;
  max-height: 20%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.induct-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.induct-content {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
  height: 60px;
  overflow-y: auto;
}

/* 调整文件列表区域 */
.file-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 240px); /* 减去简介区域和操作按钮的高度 */
  border: none;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  margin-bottom: 20px; /* 与底部操作按钮保持间距 */
}

/* 调整文件列表项样式 */
.file-item, .folder-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.file-item:last-child, .folder-item:last-child {
  border-bottom: none;
}

/* 调整操作按钮区域 */
.file-operations {
  width: 100%;
  height: 80px;
  padding: 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 调整个人信息区域 */
.info {
  width: 260px;
  height: calc(100% - 40px);
  border: none;
  margin: 20px 20px 20px 0;
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.user-profile {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-details {
  width: 100%;
  text-align: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

/* 你的样式代码 */
#content_box {
  position: relative;
  height: calc(100vh - 60px);
  width: 90%;
  left: 0;
  top: 0;
}
a {
  display: block;
  width: max-content;
  text-decoration: none;
}
a:visited {
  color: black !important;
}
#link {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-family: 幼圆;
  margin: 15px 0 20px 15px;
  width: max-content;
}
#link::before {
  content: "";
  background-image: url("../assets/返回.svg");
  display: inline-block;
  width: 20px; /* 控制宽度 */
  height: 20px; /* 控制高度 */
  background-size: contain; /* 图片自适应大小 */
  background-repeat: no-repeat;
  background-position: center;
}
.details {
  width: 100%; /* 列表宽度 */
  height: 100%;
  display: flex;
}

.induct {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  margin: 10px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.induct-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.induct-content {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.file-item, .folder-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  transition: all 0.3s ease;
}

.file-item:hover, .folder-item:hover {
  background-color: #f5f7fa;
}

.file {
  position: relative;
  flex: 1;
}

.file-list {
  display: flex;
  flex-direction: column;
  width: 90%;
  height: 50%;
  overflow-y: auto;
  margin: 10px 20px;
  border: none;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.file-icon {
  width: 20px;
  height: 20px;
  margin: 0 12px;
  opacity: 0.7;
}
.file-name {
  font-size: 14px;
  flex: 1;
  color: #333;
  cursor: pointer;
}
.file-checkbox {
  width: 16px;
  height: 16px;
  margin-left: 12px;
  cursor: pointer;
  border-radius: 4px;
  border: 2px solid #ddd;
  transition: all 0.3s ease;
}
.file-operations {
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 16px;
  background-color: white;
  border-top: 1px solid #eee;
  border-radius: 0 0 20px 20px;
}
.file-operations button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin: 0 12px;
  border: none;
  border-radius: 8px;
  background-color: #f5f7fa;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.file-operations button:hover {
  transform: translateY(-2px);
  background-color: #f0f2f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.file-operations button img {
  width: 20px;
  height: 20px;
  opacity: 0.7;
}
.info {
  height: 90%;
  width: 15%;
  border: none;
  margin: auto 30px auto 0;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.info img {
  width: 50px;
  height: 50px;
}
.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s linear infinite;
  margin: auto;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.user-details {
  text-align: center;
}
.username {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}
.user-intro {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}
</style>
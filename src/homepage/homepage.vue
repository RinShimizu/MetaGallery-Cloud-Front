<script setup>
import { computed, provide, ref, watch, onUnmounted } from 'vue';
import Userinfo from "@/components/userinfo.vue";
import { getCurrentFolderID, showLabelAlert, uploadFile} from "@/homepage/api.js";
import { useEventBus } from "@vueuse/core";
import {onBeforeRouteLeave} from "vue-router";

// 用户信息加载
const userData = JSON.parse(localStorage.getItem('userData'));
const userInfo = userData.data.userInfo;
const eventBus = useEventBus("folder-update");
const eventBus1 = useEventBus("search-update");
const folder_id=ref();

// 界面切换逻辑
const selectedIndex = ref(0);
// 更新选中按钮并跳转路径
const selectButton = (index) => {
  selectedIndex.value = index;
  searchQuery.value = ""; // 清空搜索框内容
}

// 控制用户信息显示的状态
const showUserInfo = ref(false);
let hoverTimer = null;
let leaveTimer = null;

// 鼠标进入头像区域
const handleMouseEnter = () => {
  clearTimeout(leaveTimer); // 清除离开定时器
  showUserInfo.value = true;
};

// 鼠标离开头像区域
const handleMouseLeave = () => {
  // 添加延迟，给用户足够时间移动到卡片上
  leaveTimer = setTimeout(() => {
    showUserInfo.value = false;
  }, 300);
};

// 清理定时器
const clearTimers = () => {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
  if (leaveTimer) {
    clearTimeout(leaveTimer);
    leaveTimer = null;
  }
};

// 在组件卸载时清除定时器
onUnmounted(() => {
  clearTimers();
});

const imgURL = userInfo.avatar;// 路由配置
const configs = [
  { path: "/", placeholder: "搜索我的文件" },
  { path: "/share", placeholder: "搜索我的共享" },
  { path: "/star", placeholder: "搜索我的收藏" },
  { path: "/gallery", placeholder: "搜索画廊" },
  { path: "/rubbish", placeholder: "搜索回收站文件" },
];

// 搜索逻辑
const searchQuery = ref("");
const currentPlaceholder = computed(() => {
  const config = configs[selectedIndex.value];
  return config ? config.placeholder : "搜索";
});


const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    showLabelAlert("请输入搜索内容！");
    return;
  }
  // 将 selectedIndex 和搜索内容一起传递
  eventBus1.emit({ index: selectedIndex.value, query: searchQuery.value });
};

const clear = () => {
  searchQuery.value = "";
  eventBus1.emit({ index: selectedIndex.value, query: "" }); // 清空时也需要通知页面
};

// 文件上传逻辑
const fileInput = ref(null);
const selectedFile = ref(null);
const handleFileUpload = async () => {
  fileInput.value.click();
};
const handleFileChange = async (event) => {
  const file = event.target;
  if (file) {
    selectedFile.value = file;
    folder_id.value = getCurrentFolderID();
    uploadFile(selectedFile, userData.data.token, userInfo.account, folder_id.value)
        .then(result => {
          eventBus.emit(folder_id.value, result); // 触发事件
        })
  }
};
</script>

<template>
  <div class="header">
    <div class="logo">
      <span id="s1">Meta</span><span id="s2">Gallery </span><span id="s3">&ensp;Cloud</span>
    </div>
    <div class="searchbox">
      <button class="button1" @click="handleSearch">
        <img src="../assets/搜索.svg" alt="搜索">
      </button>
      <input
          type="text"
          class="input"
          @keyup.enter="handleSearch"
          :placeholder="currentPlaceholder"
          v-model="searchQuery"
      />
      <button class="button2" @click="clear">
        <img src="../assets/取消.svg" alt="清除">
      </button>
    </div>
    <button id="post" @click="handleFileUpload">
      <img src="../assets/上传.svg" alt="上传" width="25" height="25"> 上传文件
    </button>
    <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" />
    <div class="user">
      <div class="user-profile" 
           @mouseenter="handleMouseEnter"
           @mouseleave="handleMouseLeave">
        <img :src="userInfo.avatar" alt="用户头像" class="user-avatar">
        <userinfo v-if="showUserInfo" 
                  class="user-info-popup"
                  @mouseenter="handleMouseEnter"
                  @mouseleave="handleMouseLeave"/>
      </div>
    </div>
  </div>
  <div class="sidebar">
    <div class="menu">
      <router-link to="/">
        <button :class="{ active: selectedIndex === 0 }" @click="selectButton(0)">
          <img src="../assets/文件.svg" alt="文件">我的文件
        </button>
      </router-link>
      <router-link to="/share">
        <button :class="{ active: selectedIndex === 1 }" @click="selectButton(1)">
          <img src="../assets/分享.svg" alt="共享">我的共享
        </button>
      </router-link>
      <router-link to="/star">
        <button :class="{ active: selectedIndex === 2 }" @click="selectButton(2)">
          <img src="../assets/收藏.svg" alt="收藏">我的收藏
        </button>
      </router-link>
      <router-link to="/gallery">
        <button :class="{ active: selectedIndex === 3 }" @click="selectButton(3)">
          <img src="../assets/图片.svg" alt="画廊">画廊
        </button>
      </router-link>
      <router-link to="/rubbish">
        <button :class="{ active: selectedIndex === 4 }" @click="selectButton(4)">
          <img src="../assets/回收站.svg" alt="回收站">回收站
        </button>
      </router-link>
    </div>
    <div class="bottom-image">
      <img src="../assets/MBE风格多色图标-云盘.svg" alt="底部图片" />
    </div>
  </div>
  <div class="content">
    <router-view></router-view>
  </div>
</template>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 头部导航栏 */
.header {
  height: 70px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

/* Logo样式 */
.logo {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 200px;
}

#s1, #s2, #s3 {
  font-size: 22px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

#s1 { color: #EE6363; }
#s2 { color: #FFA54F; }
#s3 { color: #4095E5; }

/* 搜索框 */
.searchbox {
  flex: 1;
  max-width: 500px;
  height: 42px;
  background: #f0f2f5;
  border-radius: 21px;
  display: flex;
  align-items: center;
  margin: 0 20px;
  transition: all 0.3s ease;
}

.searchbox:focus-within {
  background: white;
  box-shadow: 0 0 0 2px rgba(64, 149, 229, 0.2);
}

.button1, .button2 {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
}

.button1 img, .button2 img {
  width: 18px;
  height: 18px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.button1:hover img, .button2:hover img {
  opacity: 1;
}

.input {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 10px;
  font-size: 15px;
  color: #333;
}

.input:focus {
  outline: none;
}

/* 上传按钮 */
#post {
  height: 42px;
  padding: 0 25px;
  background: #4095E5;
  color: white;
  font-size: 15px;
  font-weight: 500;
  border-radius: 21px;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

#post:hover {
  background: #3084d4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 149, 229, 0.2);
}

/* 用户区域 */
.user {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: 20px;
  min-width: 120px;
}

#pic {
  width: 24px;
  height: 24px;
  opacity: 0.7;
}

.user button {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #fff;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 0;
}

.user button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user button:hover {
  border-color: #4095E5;
  transform: scale(1.05);
}

/* 侧边栏 */
.sidebar {
  position: fixed;
  left: 0;
  top: 70px;
  width: 220px;
  height: calc(100vh - 70px);
  background: white;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  z-index: 90;
}

.menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
  gap: 5px;
}

.menu a {
  text-decoration: none;
}

.menu button {
  width: 100%;
  height: 45px;
  padding: 0 15px;
  border: none;
  border-radius: 10px;
  background: transparent;
  font-size: 15px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu button img {
  width: 20px;
  height: 20px;
  opacity: 0.7;
}

.menu button.active {
  background: rgba(64, 149, 229, 0.08);
  color: #4095E5;
  font-weight: 500;
}

.menu button.active img {
  opacity: 1;
}

.menu button:hover:not(.active) {
  background: rgba(0, 0, 0, 0.03);
}

/* 底部图片 */
.bottom-image {
  padding: 15px;
  margin-top: auto;
}

.bottom-image img {
  width: 100%;
  border-radius: 10px;
  opacity: 0.9;
}

/* 主内容区域 */
.content {
  margin-left: 220px;
  margin-top: 70px;
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
}

/* 用户信息弹出框 */
.info {
  position: absolute;
  top: 60px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 110;
}

.user-profile {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info-popup {
  position: absolute;
  top: 100%;
  right: 0;
}

/* 创建一个连接区域 */
.user-profile::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 20px;
  background: transparent;
}
</style>
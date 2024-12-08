<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { useEventBus } from "@vueuse/core";
import fileURL from '../assets/文件.svg';
import folderURL from '../assets/文件夹.svg';
import {
  changeCurrentFolderID,
  fetchSubInfo,
  getCurrentFolderID,
  createFolder,
  preJudge,
  labelShake, labelFocus,
  creatIng, showLabelAlert, renameFolder, deleteItems,
  isAllSelectedFilesFavorited, markAsFavorite, favoriteButtonIcon,
  shareItems,
  showFileOrFolderInfo, hideFileOrFolderInfo, fileOrFolderInfo, popupTop, popupLeft, renameFile,//悬停和重命名
  downloadFile,//下载
  //previewFile//预览
} from '../homepage/api.js'


import favoriteIcon from '../assets/已收藏.svg';
import unfavoriteIcon from '../assets/收藏.svg';
//用户信息加载,不要重复写
//包括name,account,avatar,intro,token(这个在userdata里，别的在userinfo里)
const userData = JSON.parse(localStorage.getItem('userData'));
const rootFolderID = JSON.parse(localStorage.getItem('rootFolderData')).id;
var userInfo = userData.data.userInfo;
let Stack = []; // 定义一个栈来存储，栈元素是一个二元组，第一个元素为文件夹，第二个元素为文件
const eventBus = useEventBus("folder-update");
const token = localStorage.getItem('token');

var isCancel = false;
var isEd = false;
var isRe = false;
let isFolder = false; // 标记是否为文件夹
const isAllSelected = ref(false);

//获取当前页面文件夹和文件
var folders = ref([]);
var files = ref([]);
var oldName = '';

onMounted(async () => {
  Stack.length = 0;
  changeCurrentFolderID(rootFolderID); //这里更改为用户根文件夹ID
  await fetchSubInfo(Stack, userData.data.token, userInfo.account, rootFolderID);
  folders.value = Stack[Stack.length - 1][0];
  files.value = Stack[Stack.length - 1][1];
  console.log(Stack,"tishi");
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

const isMultipleSelected = computed(() => {
  // 计算总选中数量
  const totalSelected = selectedIds.value.files.length + selectedIds.value.folders.length;
  return totalSelected > 1; // 如果总选中数量大于 1，返回 true
});

const selectAll = () => {
  isAllSelected.value = !isAllSelected.value;
  const newState = isAllSelected.value;
  [...files.value, ...folders.value].forEach(item => (item.selected = newState));
};

const getFolderFile = async (ID) => {
  changeCurrentFolderID(ID);
  console.log("curPathID:" + ID);
  await fetchSubInfo(Stack, userData.data.token, userInfo.account, ID);
  folders.value = Stack[Stack.length - 1][0];
  files.value = Stack[Stack.length - 1][1];
}

onMounted(() => {
  eventBus.on((folderID) => {
    Stack.pop();
    getFolderFile(folderID); // 响应事件
  });
});

// 新建文件夹函数
const addNewFolder = async () => {
  console.log('adding');
  if (isEd) return;
  isEd = true;
  let newFolder;
  newFolder = creatIng(folders, isCancel);
  await nextTick();
  // 焦点集中在新文件夹的输入框上
  const index = folders.value.indexOf(newFolder);
  const inputEl = document.getElementById(`folder-input-${index}`);
  labelFocus(inputEl);
  isFolder = true;
};

const handleCancel = (index) => {
  isCancel = true;
  var inputEl;
  // 如果 isRe 为 false，则删除当前条目
  if(isFolder){
    if (!isRe) {
      folders.value[index].isEditing = false;
      folders.value.splice(index, 1); // 删除当前条目
    }
    else {
      // 如果是重命名取消，不做任何修改，只关闭输入框
      const item = folders.value[index];
      if (item) {
        item.isEditing = false; // 设置为非编辑状态
        inputEl = document.getElementById(`folder-input-${index}`);
        if (inputEl) {
          inputEl.blur(); // 关闭输入框
          item.name = oldName;
        }
      }
    }
  }
  else{
    console.log("这是文件重命名",oldName);
    const item = files.value[index];
    if (item) {
      item.isEditing = false; // 设置为非编辑状态
      inputEl = document.getElementById(`file-input-${index}`);
    }
    if (inputEl) {
      inputEl.blur(); // 关闭输入框
      console.log(123);
      item.FileName = oldName;
      console.log(123);
    }
  }
  isCancel=false;
  isEd=false;
};

const finishEditing = (item, index, isRename, isFolder) => {
  if (!item.isEditing || isCancel) return; // 防止重复处理

  // 文件名校验逻辑
  const msg = preJudge(isFolder,(isFolder ? folders.value : files.value), item);
  const inputEl = document.getElementById(`folder-input-${index}`);
  if (msg.trim() !== '') {
    showLabelAlert(msg);
    item.isEditing = true;
    nextTick(() => {
      labelShake(inputEl);
    });
    return;
  }
  console.log(isRename);
  const account = userInfo.account; // 从 userData 获取 account
  const folderID = getCurrentFolderID();
  console.log('1',folderID);
  var result = '';
  //
  if (!isRename) {
    createFolder(folderID, item, token, account, index, item.isEditing, inputEl);
    result = '文件夹创建成功!';
  } else {
    if (isFolder) {
      renameFolder(folders.value, item, oldName, account, token, item.isEditing);
      result = '文件夹重命名成功！';
      isRe = false;
    }
    else{
      renameFile(files.value, item, oldName, account, token, item.isEditing);
      result = '文件重命名成功！';
      isRe = false;
    }
  }
  showLabelAlert(result);
  item.isEditing = false;
  isEd = false
};

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

const reName = (selectedIds) => {
  isFolder = false;
  isRe = true;
  const folderIds = selectedIds.folders; // 选中的文件夹数组
  const fileIds = selectedIds.files; // 选中的文件数组
  console.log('Selected IDs:', folderIds);
  let item = null; // 将用于保存目标文件/文件夹

  let index;

  if (folderIds.length === 1) {
    // 文件夹重命名
    index = folders.value.findIndex((folder) => folder.id === folderIds[0].id);
    item = folders.value[index];
    isFolder = true;
    oldName = item.name;

    // 设置为编辑模式
    item.isEditing = true;
    console.log("item:", item);
    nextTick(() => {
      const inputEl = document.getElementById(`folder-input-${index}`);
      if (inputEl) {
        labelFocus(inputEl); // 聚焦到输入框
      }
    });
  }
  else if (fileIds.length === 1) {
    // 文件重命名
    index = files.value.findIndex((file) => file.ID === fileIds[0].ID);
    item = files.value[index];
    oldName = item.FileName;

    // 设置为编辑模式
    item.isEditing = true;
    console.log("item:", item);
    nextTick(() => {
      const inputEl = document.getElementById(`file-input-${index}`);
      if (inputEl) {
        labelFocus(inputEl); // 聚焦到输入框
      }
    });
  }



};

const showDeleteModal = ref(false); // 控制模态框显示的状态

const clickDel = (selectedIds) => {
  // 显示模态框而不是直接删除
  showDeleteModal.value = true;
};

// 确认删除
const confirmDelete = () => {
  console.log(selectedIds);
  deleteItems(selectedIds, token, userInfo.account)
      .then(result => {
        showLabelAlert(result);// 输出 "删除成功" 或 "删除失败: 错误信息"
      })
      .catch(error => {
        console.error('处理删除结果时发生错误:', error);
      });
  folders.value = folders.value.filter(folder => !selectedIds.value.folders.includes(folder));
  files.value = files.value.filter(folder => !selectedIds.value.files.includes(folder));
  showDeleteModal.value = false; // 关闭模态框
};

// 取消删除
const cancelDelete = () => {
  showDeleteModal.value = false; // 关闭模态框
};

//share
const isShare = ref(false); // 控制模态框显示的状态
const clickShare=(selectedIds)=>{
  isShare.value=true;
}

const confirmShare = () => {
  const input1Value = document.getElementById("input1").value;
  const input2Value = document.getElementById("input2").value;
  // if(input1Value==='')showLabelAlert('共享文件未命名！');
  if (input1Value.trim() === '') {
    showLabelAlert('共享文件未命名！');
    nextTick(() => {
      labelShake(document.getElementById("input1"));
    });
    return;
  }
  if (input2Value.trim() === '') {
    showLabelAlert('简介不能为空！');
    nextTick(() => {
      labelShake(document.getElementById("input2"));
    });
    return;
  }
  shareItems(selectedIds, token, userInfo.account,input1Value,input2Value)
      .then(result => {
        showLabelAlert(result);// 输出 "删除成功" 或 "删除失败: 错误信息"
      })
      .catch(error => {
        console.error('共享时发生错误:', error);
      });
  document.getElementById("input1").value="";
  document.getElementById("input2").value="";
  isShare.value = false; // 关闭模态框
};

// 取消删除
const cancelShare = () => {
  document.getElementById("input1").value="";
  document.getElementById("input2").value="";
  isShare.value = false; // 关闭模态框
};

//收藏按钮
// 判断是否所有选中的文件/文件夹已收藏
//收藏按钮
// 判断是否所有选中的文件/文件夹已收藏
const isAllFavorited = computed(() => isAllSelectedFilesFavorited(selectedIds));
var account = userInfo.account;

// 变更收藏按钮的图标，根据选中的文件是否已收藏来判断
const handleMarkAsFavorite = () => {
  console.log("se",selectedIds);
  markAsFavorite(selectedIds, account, token, isAllFavorited.value);
};

const currentFavoriteButtonIcon = computed(() => favoriteButtonIcon(isAllFavorited.value, favoriteIcon, unfavoriteIcon));
//下载函数
const handleBatchDownload= () => {
  downloadFile(account, selectedIds, token);
}

//预览函数
// const handlepreviewFile=()=>{
//   previewFile(account,fileID);
// }
</script>

<template>
  <div id="filebox">
    <div class="file_header">
      <p>我的文件</p>
      <div id="alert-container"></div> <!-- 中间的label容器 -->
      <button id="allSelected" style="margin-right: 15px;" @click="selectAll">
        <img src="../assets/全选.svg" alt="" style="width: 30px; height: 30px;">
      </button>
      <button id="addFolder" @click="addNewFolder">
        <img src="../assets/新建文件夹.svg" alt="" style="width: 30px; height: 30px;">
      </button>
      <button id="back" @click="goBackToParentFolder">
        <img src="../assets/回退.svg" alt="" style="width: 30px; height: 30px;margin-right: -15px;">
      </button>
    </div>
    <div class="file_op">
      <div class="file-list">
        <!-- 文件夹列表 -->
        <div class="folder-item" v-for="(folder, index) in folders" :key="folder.id">
          <img src="../assets/已收藏文件.svg" alt="" v-if="folder.isFavorite" style="width: 20px;height: 20px;">
          <img v-else src="../assets/未收藏文件.svg" alt="" style="width: 20px;height: 20px;">
          <img :src=folderURL alt="文件夹图标" class="file-icon" />
          <template v-if="folder.isEditing">
            <input v-model="folder.name" :id="`folder-input-${index}`" class="file-input"
                   @blur="finishEditing(folder, index, isRe,isFolder)"
                   @keydown.enter="finishEditing(folder, index, isRe,isFolder)"/>
            <button @mousedown.prevent="handleCancel(index)" style="background: none; border: none; padding: 0; color: inherit; cursor: pointer;">>取消</button> <!-- 添加取消按钮 -->
          </template>
          <template v-else>
            <a href="" class="file-name" @click.prevent="getFolderFile(folder.id)"
               @mouseover="showFileOrFolderInfo(folder.id, 'folder', token, userInfo.account,$event)"
               @mouseout="hideFileOrFolderInfo">{{ folder.name }}</a>
            <input type="checkbox" v-model="folder.selected" class="file-checkbox" /> <!-- 文件夹复选框 -->
          </template>
        </div>
        <div class="file-item" v-for="(file, index) in files" :key="file.ID">
          <img src="../assets/已收藏文件.svg" alt="" v-if="file.isFavorite" style="width: 20px;height: 20px;">
          <img src="../assets/未收藏文件.svg" alt="" v-if="!file.isFavorite" style="width: 20px;height: 20px;">
          <img :src="fileURL" alt="文件图标" class="file-icon"/>
          <template v-if="file.isEditing">
            <input v-model="file.FileName" :id="`file-input-${index}`" class="file-input"
                   @blur="finishEditing(file, index, isRe,isFolder)"
                   @keydown.enter="finishEditing(file, index, isRe,isFolder)"/>
            <button @mousedown.prevent="handleCancel(index)" style="background: none; border: none; padding: 0; color: inherit; cursor: pointer;">>取消</button> <!-- 添加取消按钮 -->
          </template>
          <template v-else>
            <a href="" class="file-name"
               @mouseover="showFileOrFolderInfo(file.ID, 'file', token, userInfo.account,$event)"
               @mouseout="hideFileOrFolderInfo">{{ file.FileName }}</a>
<!--               @dblclick="handlepreviewFile(userInfo.account,file.ID)"-->

            <input type="checkbox" v-model="file.selected" class="file-checkbox" /> <!-- 文件夹复选框 -->
          </template>
        </div>
      </div>
      <div class="file-operations" v-if=isAnyFileSelected>
        <button @click="handleBatchDownload"><img src="../assets/下载.svg" alt="">下载</button>
        <button v-if="!isMultipleSelected" @click="reName(selectedIds)"><img src="../assets/重命名.svg" alt="">重命名</button>
        <button v-if="!isMultipleSelected" @click="clickShare(selectedIds)"><img src="../assets/分享.svg" alt="">共享</button>
        <button @click="clickDel(selectedIds)"><img src="../assets/回收站.svg" alt="">删除</button>
        <button @click="handleMarkAsFavorite">
          <img :src="currentFavoriteButtonIcon" alt="收藏按钮">收藏
        </button>
      </div>
    </div>
    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <h3>确定将选中的项目移入回收站？</h3>
        <p>回收站中的项目将保留30天，您可以随时恢复它们</p>
        <button id="btn1" @click="confirmDelete">确 定</button>
        <button id="btn2" @click="cancelDelete">取 消</button>
      </div>
    </div>
    <!-- 分享确认模态框 -->
    <div v-if="isShare" class="shareModal">
      <div class="modal-content">
        <!-- 左上角分享标题 -->
        <h3 class="modal-title">共享</h3>

        <!-- 主体内容区域 -->
        <div class="content-container">
          <!-- 左侧上传封面 -->
          <div class="upload-section">
            <button id="uploadCover" style="background: none; border: none; cursor: pointer;">
              <img src="../assets/上传封面.svg" alt="上传封面" style="width: 50px; height: 50px;" />
            </button>
            <p>上传封面（可选）</p>
          </div>

          <!-- 右侧输入框区域 -->
          <div class="input-group">
            <input type="text" id="input1" placeholder="文件名" />
            <textarea id="input2" placeholder="简介"></textarea>
          </div>
        </div>

        <!-- 底部按钮，居中对齐 -->
        <div class="button-group">
          <button @click="confirmShare">确认</button>
          <button @click="cancelShare">取消</button>
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
#filebox {
  position: relative;
  height: calc(100vh - 60px);
  width: 90%;
  left: 0;
  top: 0;
}

.file_header {
  position: relative;
  display: flex;
  height: 20px;
  margin: 15px 0 20px 15px;
}

.file_header p {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-family: 幼圆;
  margin: 0;
}

.file_header p::before {
  content: "";
  background-image: url("../assets/文件.svg");
  display: inline-block;
  width: 20px; /* 控制宽度 */
  height: 20px; /* 控制高度 */
  background-size: contain; /* 图片自适应大小 */
  background-repeat: no-repeat;
  background-position: center;
  margin-left: 15px;
}

.file_header button {
  background: none; /* 去掉按钮背景 */
  border: none; /* 去掉按钮边框 */
  padding: 0; /* 去掉内边距 */
  cursor: pointer; /* 设置鼠标指针 */
}

.file_op {
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

.folder-item {
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #ddd; /* 分隔线 */
}

.file-item {
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #ddd; /* 分隔线 */
}

.file-icon {
  width: 20px;
  height: 20px;
  margin: 0 8px 0 10px; /* 图标和文件名之间的间距 */
}

.file-name {
  font-size: 16px;
  width: fit-content;
  display: block;
  text-decoration: none;
}

.file-name:visited {
  color: black;
}

.file-name:hover {
  color: #007bff;
}

.file-checkbox {
  margin-left: auto; /* 文件名和复选框之间的间距 */
}

.file-operations {
  position: absolute;
  bottom: 0;
  display: inline-flex;
  width: 100%;
  z-index: 2;
  border-radius: 20px;
  background-color: white;
}

.file-operations button {
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

.file-operations button img {
  width: 50%;
  height: auto;
}

.info-popup {
  position: absolute;
  top: 50px; /* 距离父元素顶部50px */
  left: 100px; /* 距离父元素左侧100px */
  background: rgba(229, 241, 248, 0.73);
  color: #0c0c0c;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  font-family: 幼圆;
  z-index: 100; /* 确保它在前面 */
  display: block; /* 确保它可以显示 */
  font-weight: bold; /* 加粗字体 */
}

#addFolder {
  margin-left: auto; /* 将按钮推到右侧 */
}

#back {
  margin-left: 10px; /* 给返回按钮添加一点间隔 */
}

/* alert-container 样式 */
#alert-container {
  flex: 1; /* 让其占据可用空间 */
  text-align: center; /* 文本居中 */
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-5px);
  }
  40%, 80% {
    transform: translateX(5px);
  }
}

.file-input {
  font-size: 16px;
  margin-left: 4px; /* 输入框和图标之间的最小间距 */
  height: 30px;
  flex: 1;
  border: #cccccc 1px solid;
}

.file-input:focus {
  margin-left: 4px;
  outline: none; /* 去掉默认的 focus 样式 */
  border-color: #cccccc;
}

.file-input.shake {
  animation: shake 0.3s ease-in-out;
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

/* 模态框背景 */
.shareModal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* 模态框内容 */
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  position: relative;
}

/* 标题 */
.modal-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  margin-top: 5px; /* 让标题更靠上 */
}

/* 主体内容容器 */
.content-container {
  display: flex;
  align-items: flex-start; /* 左侧靠上对齐 */
}

/* 左侧上传封面区域 */
.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
  margin-top: 40px; /* 调整上传封面更靠下 */
}

.upload-section img {
  cursor: pointer;
  margin-bottom: 5px;
}

.upload-section p {
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* 输入框区域 */
.input-group {
  flex-grow: 1;
  padding-right: 20px; /* 增加右侧内边距 */
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.input-group textarea {
  height: 120px;
}

/* 文本框聚焦时的样式 */
input[type="text"]:focus, textarea:focus {
  border-color: #66afe9; /* 柔和的蓝色边框 */
  box-shadow: 0 0 5px rgba(102, 175, 233, 0.5); /* 添加蓝色光晕效果 */
}

/* 底部按钮区域，居中对齐 */
.button-group {
  display: flex;
  justify-content: center; /* 居中对齐 */
  margin-top: 10px;
}

.button-group button {
  margin: 0 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  transition: background-color 0.3s, color 0.3s; /* 增加平滑过渡效果 */
}


/* 鼠标悬浮时的样式 */
.button-group button:hover {
  background-color: #0056b3; /* 悬浮时更深的蓝色 */
  color: #e0f7fa; /* 更亮的文字颜色 */
}

/* 鼠标按下时的样式 */
.button-group button:active {
  background-color: #003f7f; /* 按下时更深的蓝色 */
  color: #ffffff; /* 保持白色文字 */
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
</style>
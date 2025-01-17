<script setup>
import {ref, computed, nextTick, onMounted, inject, onBeforeUnmount, watch} from 'vue';
import { useEventBus } from "@vueuse/core";
import fileURL from '../assets/文件.svg';
import folderURL from '../assets/文件夹.svg';
import cover from '../assets/上传封面.svg';
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
  downloadFile, searchInFile,//下载
  //previewFile//预览

  handlepreviewFile,isLoading//预览
} from '../homepage/api.js'


import favoriteIcon from '../assets/已收藏.svg';
import unfavoriteIcon from '../assets/收藏.svg';
import {useRoute} from "vue-router";
//用户信息加载,不要重复写
//包括name,account,avatar,intro,token(这个在userdata里，别的在userinfo里)
const userData = JSON.parse(localStorage.getItem('userData'));
const rootFolderID = JSON.parse(localStorage.getItem('rootFolderData')).id;
var userInfo = userData.data.userInfo;
let Stack = []; // 定义一个栈来存储，栈元素是一个二元组，第一个元素为文件夹，第二个元素为文件
const eventBus = useEventBus("folder-update");
const token = localStorage.getItem('token');
const eventBus1 = useEventBus("search-update");

var isCancel = false;
var isEd = false;
var isRe = false;
let isFolder = false; // 标记是否为文件夹
const isAllSelected = ref(false);

//获取当前页面文件夹和文件
var folders = ref([]);
var files = ref([]);
var oldName = '';
const previewContent = ref('');
const searchQuery = ref(""); // 当前搜索关键字

const performSearch = (query) => {
  const id=getCurrentFolderID();
  searchInFile(token, userInfo.account, id, query)
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
    if (index === 0) {
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

onMounted(async () => {
  Stack.length = 0;
  changeCurrentFolderID(rootFolderID); //这里更改为用户根文件夹ID
  await fetchSubInfo(Stack, userData.data.token, userInfo.account, rootFolderID);
  folders.value = Stack[Stack.length - 1][0];
  files.value = Stack[Stack.length - 1][1];
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

const isSingleFolderSelected=computed(()=>{
  return selectedIds.value.folders.length === 1 && selectedIds.value.files.length === 0;
});

const selectAll = () => {
  isAllSelected.value = !isAllSelected.value;
  const newState = isAllSelected.value;
  if(files.value)
    files.value.forEach(item => (item.selected = newState));
  if(folders.value)
    folders.value.forEach(item => (item.selected = newState));
};

const getFolderFile = async (ID) => {
  changeCurrentFolderID(ID);
  await fetchSubInfo(Stack, userData.data.token, userInfo.account, ID);
  folders.value = Stack[Stack.length - 1][0];
  files.value = Stack[Stack.length - 1][1];
}

onMounted(() => {
  eventBus.on((folderID, msg) => {
    Stack.pop();
    getFolderFile(folderID); // 响应事件
    showLabelAlert(msg);
  });
});

// 新建文件夹函数
const addNewFolder = async () => {
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
      // 如果是重命名取消，不做任何修改，闭输入框
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
    const item = files.value[index];
    if (item) {
      item.isEditing = false; // 设置为非编辑状态
      inputEl = document.getElementById(`file-input-${index}`);
    }
    if (inputEl) {
      inputEl.blur(); // 关闭输入框
      item.FileName = oldName;
    }
  }
  isCancel=false;
  isEd=false;
};

const finishEditing = async (item, index, isRename, isFolder) => {
  if (!item.isEditing || isCancel) return; // 防止重复处理

  // 文件名校验逻辑
  const msg = preJudge(isFolder, (isFolder ? folders.value : files.value), item);
  const inputEl = document.getElementById(`folder-input-${index}`);
  if (msg.trim() !== '') {
    showLabelAlert(msg);
    item.isEditing = true;
    nextTick(() => {
      labelShake(inputEl);
    });
    return;
  }
  const account = userInfo.account; // 从 userData 获取 account
  const folderID = getCurrentFolderID();
  var result = '';
  // var folder=[];
  //
  if (!isRename) {
    result = await createFolder(Stack,folderID, item, token, account, index, item.isEditing, inputEl);
    // result = '文件夹创建成功!';
    folders.value = Stack[Stack.length - 1][0];
    files.value = Stack[Stack.length - 1][1];
  } else {
    if (isFolder) {
      result =await renameFolder(folders.value, item, oldName, account, token, item.isEditing, result);
      if (result !== '文件夹重命名成功！') {
        item.name = oldName;
      }
      isRe = false;
    } else {
      result =await renameFile(files.value, item, oldName, account, token, item.isEditing);
      if (result !== '文件重命名成功！') {
        item.FileName = oldName;
      }
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
const uploadCoverInput = ref(null); // 文件上传控件的引用
const coverPreview = ref(null); // 预览封面的引用

// 打开模态框
const clickShare = (selectedIds) => {
  isShare.value = true;
};

// 触发上传控件
const triggerUpload = () => {
  uploadCoverInput.value.click();
};

// 处理封面上传
const handleCoverUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      coverPreview.value.src = e.target.result; // 更新预览图
    };
    reader.onerror = (error) => {
      console.error("文件读取错误:", error);
    };
    reader.readAsDataURL(file);
  } else {
    console.warn("没有选择文件。");
  }
};

// 确认分享操作
const confirmShare = async () => {
  const input1 = document.getElementById("input1").value.trim();
  const input2 = document.getElementById("input2").value.trim();
  const coverFile = uploadCoverInput.value.files[0]; // 获取封面文件

  // 验证输入
  if (!input1) {
    showLabelAlert("共享文件未命名！");
    nextTick(() => labelShake(document.getElementById("input1")));
    return;
  }
  if (!input2) {
    showLabelAlert("简介不能为空！");
    nextTick(() => labelShake(document.getElementById("input2")));
    return;
  }

  // 模拟调用分享 API
  await shareItems(selectedIds, token, userInfo.account, input1, input2, coverFile)
      .then((result) => {
        showLabelAlert("共享成功！");
      })
      .catch((error) => {
        console.error("共享失败:", error);
        showLabelAlert("共享失败，请重试！");
      });

  // 重置模态框状态
  // 重置封面和输入框
  coverPreview.value.src = "../assets/上传封面.svg";
  document.getElementById("input1").value = "";
  document.getElementById("input2").value = "";
  uploadCoverInput.value.value = ""; // 清空文件选择器
  isShare.value = false; // 关闭模态框
};


// 重置预览封面和文件选择
watch(isShare, (newValue) => {
  if (!newValue && uploadCoverInput.value) {
    uploadCoverInput.value.value = ""; // 清空文件选择器
    coverPreview.value.src = "../assets/上传封面.svg"; // 恢复默认封面
  }
});


// 取消删除
const cancelShare = () => {
  // 重置封面和输入框
  coverPreview.value.src = "../assets/上传封面.svg";
  document.getElementById("input1").value="";
  document.getElementById("input2").value="";
  isShare.value = false; // 关闭模态框
};

//收藏按钮
// 判断是否所有选中的文件/文件夹已收藏
const isAllFavorited = computed(() => isAllSelectedFilesFavorited(selectedIds));
var account = userInfo.account;

// 变更收藏按钮的图标，根据选中的文件是否已收藏来判断
const handleMarkAsFavorite = () => {
  markAsFavorite(selectedIds, account, token, isAllFavorited.value);
};

const currentFavoriteButtonIcon = computed(() => favoriteButtonIcon(isAllFavorited.value, favoriteIcon, unfavoriteIcon));
//下载函数
const handleBatchDownload= () => {
  downloadFile(account, selectedIds, token);
}

//预览函数
const showPreviewModal = ref(false);
const setPreviewContent = (url) => {
  previewContent.value = url; // 更新 previewContent
};
const handlepreviewFile1=(account,fileID,token,event)=>{
  previewContent.value ='';
  showPreviewModal.value=true;
  handlepreviewFile(account,fileID,token,setPreviewContent,event);
}
</script>

<template>
  <div id="filebox">
    <div class="file_header">
      <p>我的文件</p>
      <div id="alert-container"></div> <!-- 中间的label容器 -->
      <div class="header-buttons">
        <button id="allSelected" @click="selectAll">
          <img src="../assets/全选.svg" alt="" style="width: 30px; height: 30px;">
        </button>
        <button id="addFolder" @click="addNewFolder">
          <img src="../assets/新建文件夹.svg" alt="" style="width: 30px; height: 30px;">
        </button>
        <button id="back" @click="goBackToParentFolder">
          <img src="../assets/回退.svg" alt="" style="width: 30px; height: 30px;">
        </button>
      </div>
    </div>
    <div class="file_op">
      <div class="file-list">
        <!-- 文件夹列表 -->
        <div class="folder-item" v-for="(folder, index) in folders" :key="folder.id"
             @click="getFolderFile(folder.id);hideFileOrFolderInfo()"
             @mouseover="(e) => {
                  showFileOrFolderInfo(folder.id, 'folder', token, userInfo.account, {
                    clientX: e.clientX + 260,
                    clientY: e.clientY + 70
                  });
                }"
             @mouseout="hideFileOrFolderInfo">
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
            <span class="file-name">
              {{ folder.name }}
            </span>
            <input type="checkbox" v-model="folder.selected" class="file-checkbox" @click.stop/> <!-- 文件夹复选框 -->
          </template>
        </div>
        <div class="file-item" v-for="(file, index) in files" :key="file.ID"
             @mouseover="(e) => {
                  showFileOrFolderInfo(file.ID, 'file', token, userInfo.account, {
                    clientX: e.clientX + 260,
                    clientY: e.clientY + 70
                  });
                }"
             @mouseout="hideFileOrFolderInfo"
             @click="handlepreviewFile1(userInfo.account,file.ID,token,$event);hideFileOrFolderInfo()">
          <img src="../assets/已收藏文件.svg" alt="" v-if="file.isFavorite" style="width: 20px;height: 20px;">
          <img src="../assets/未收藏文件.svg" alt="" v-if="!file.isFavorite" style="width: 20px;height: 20px;">
          <img :src="fileURL" alt="文件图标" class="file-icon"/>
          <template v-if="file.isEditing">
            <input v-model="file.FileName" :id="`file-input-${index}`" class="file-input"
                   @blur.stop="finishEditing(file, index, isRe,isFolder)"
                   @keydown.enter.stop="finishEditing(file, index, isRe,isFolder)"
                   @click.stop/>
            <button @mousedown.stop="handleCancel(index)" style="background: none; border: none; padding: 0; color: inherit; cursor: pointer;">>取消</button> <!-- 添加取消按钮 -->
          </template>
          <template v-else>
            <span class="file-name">
              {{ file.FileName }}
            </span>
            <input type="checkbox" v-model="file.selected" class="file-checkbox" @click.stop/> <!-- 文件夹复选框 -->
          </template>
        </div>
      </div>
      <div class="file-operations" v-if=isAnyFileSelected>
        <button @click="handleBatchDownload"><img src="../assets/下载.svg" alt="">下载</button>
        <button v-if="!isMultipleSelected" @click="reName(selectedIds)"><img src="../assets/重命名.svg" alt="">重命名</button>
        <button v-if="isSingleFolderSelected" @click="clickShare(selectedIds)"><img src="../assets/分享.svg" alt="">共享</button>
        <button @click="clickDel(selectedIds)"><img src="../assets/回收站.svg" alt="">删除</button>
        <button @click="handleMarkAsFavorite">
          <img :src="currentFavoriteButtonIcon" alt="收藏按钮">收藏
        </button>
      </div>
    </div>
    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="delete-modal">
      <div class="delete-modal-content">
        <div class="modal-header">
          <h3>移入回收站</h3>
          <button class="close-button" @click="cancelDelete">×</button>
        </div>

        <div class="modal-body">
          <img src="../assets/回收站.svg" alt="回收站" class="delete-icon">
          <p class="warning-text">确定将选中的项目移入回收站吗？</p>
          <p class="tip-text">回收站中的项目将保留30天，您可以随时恢复它们</p>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" @click="cancelDelete">取消</button>
          <button class="confirm-button delete" @click="confirmDelete">移入回收站</button>
        </div>
      </div>
    </div>
    <!-- 共享模态框 -->
    <div v-if="isShare" class="share-modal">
      <div class="share-modal-content">
        <div class="modal-header">
          <h3>共享文件</h3>
          <button class="close-button" @click="isShare = false">×</button>
        </div>

        <div class="share-form">
          <div class="form-group">
            <label for="input1">共享名称</label>
            <input type="text" id="input1" placeholder="请输入共享文件名称" />
          </div>

          <div class="form-group">
            <label for="input2">文件简介</label>
            <textarea id="input2" placeholder="请输入文件简介" rows="4"></textarea>
          </div>

          <div class="form-group">
            <label>封面图片</label>
            <div class="cover-upload">
              <img :src="coverPreview?.src || cover"
                   ref="coverPreview"
                   @click="triggerUpload"
                   class="cover-preview"
              alt="111"/>
              <input type="file"
                     ref="uploadCoverInput"
                     @change="handleCoverUpload"
                     accept="image/*"
                     style="display: none" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" @click="isShare = false">取消</button>
          <button class="confirm-button" @click="confirmShare">确认共享</button>
        </div>
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
          <div v-else-if="!previewContent" class="no-preview">
            <p>该类型文件暂不支持预览</p>
          </div>
          <iframe v-else :src="previewContent" class="preview-iframe"></iframe>
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
#allSelected, #addFolder, #back {
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

#allSelected img, #addFolder img, #back img {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

#allSelected:hover, #addFolder:hover, #back:hover {
  background: rgba(64, 149, 229, 0.1);
}

#allSelected:hover img, #addFolder:hover img, #back:hover img {
  opacity: 1;
}

/* 文件操作区域美化 */
.file_op {
  position: relative;
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
}

/* 文件列表美化 */
.file-list {
  flex: 1;
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

/* 收藏图标样式 */
.folder-item img:first-child,
.file-item img:first-child {
  width: 24px;  /* 加大星星图标 */
  height: 24px;
  flex-shrink: 0;
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

/* 文件输入框样式调整 */
.file-input {
  flex: 1;
  padding: 8px 14px;  /* 加大输入框内边距 */
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;  /* 匹配文件名字体大小 */
  outline: none;
  transition: all 0.2s ease;
}

/* 悬浮和选中状态 */
.folder-item:hover, .file-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* 滚动条美化 */
.file_op::-webkit-scrollbar {
  width: 8px;
}

.file_op::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.file_op::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.file_op::-webkit-scrollbar-thumb:hover {
  background: #999;
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

/* 模态框样式美化 */
.modal, .modalpre {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content, .modal-precontent {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* 加载动画美化 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loading-image {
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 文件操作按钮组 */
.file-operations {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;  /* 增加按钮之间的间距 */
  padding: 20px 0;  /* 增加上下内边距 */
  border-top: 1px solid #eee;
  background: white;
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

/* 加载状态和无预览状态的容器样式优化 */
.loading-container, .no-preview {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
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


@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 共享模态框样式 */
.share-modal {
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

.share-modal-content {
  width: 500px;
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

.share-form .form-group input,
.share-form .form-group textarea {
  width: 100%;
  box-sizing: border-box;
}

.share-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4095E5;
  box-shadow: 0 0 0 2px rgba(64, 149, 229, 0.1);
}

.cover-upload {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cover-upload:hover {
  border-color: #4095E5;
  background: #f0f7ff;
}

.cover-preview {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
  border-radius: 4px;
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
  background: #4095E5;
  color: white;
}

.cancel-button:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.confirm-button:hover {
  background: #3084d4;
}

/* 删除模态框样式 */
.delete-modal {
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

.delete-modal-content {
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

.delete-icon {
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

.confirm-button.delete {
  border: none;
  background: #dc3545;
  color: white;
}

.cancel-button:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.confirm-button.delete:hover {
  background: #c82333;
}

</style>
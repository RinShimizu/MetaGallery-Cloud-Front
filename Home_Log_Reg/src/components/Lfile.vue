<script setup>
  import { ref, computed,  nextTick, onMounted } from 'vue';
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
    creatIng, showLabelAlert, renameFolder, deleteItems
  } from '../homepage/api.js'

  import favoriteIcon from '../assets/已收藏.svg';
  import unfavoriteIcon from '../assets/收藏.svg';
  //用户信息加载,不要重复写
  //包括name,account,avatar,intro,token(这个在userdata里，别的在userinfo里)
  const userData = JSON.parse(localStorage.getItem('userData'));
  var userInfo = userData.data.userInfo;
  let Stack = []; // 定义一个栈来存储，栈元素是一个二元组，第一个元素为文件夹，第二个元素为文件
  const eventBus = useEventBus("folder-update");
  const token = localStorage.getItem('token');

  var isCancel = false;
  var isEd=false;
  var isRe=false;
  let isFolder = false; // 标记是否为文件夹
  const isAllSelected = ref(false);

  //获取当前页面文件夹和文件
  var folders = ref([]);
  var files = ref([]);
  var oldName='';

  onMounted(async () => {
    Stack.length = 0;
    changeCurrentFolderID(1);
    await fetchSubInfo(Stack,userData.data.token, userInfo.account,1);
    folders.value = Stack[Stack.length - 1][0];
    files.value = Stack[Stack.length - 1][1];
  })

  const selectedIds = computed(() => {
    return {
      files: files.value.filter(file => file.selected), // 选中的文件对象数组
      folders: folders.value.filter(folder => folder.selected), // 选中的文件夹对象数组
    };
  });


  const isSingleSelected = computed(() => {
    // 计算总选中数量
    const totalSelected = selectedIds.value.files.length + selectedIds.value.folders.length;
    return totalSelected === 1; // 如果总选中数量为 1，返回 true
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
    console.log("curPathID:"+ID);
    await fetchSubInfo(Stack, userData.data.token, userInfo.account, ID);
    folders.value = Stack[Stack.length - 1][0];
    files.value = Stack[Stack.length - 1][1];
    console.log("Stack:",Stack);
  }

  onMounted(() => {
    eventBus.on((folderID) => {
      if(folderID !== 1){
        goBackToParentFolder();
      }
      else{
        Stack.length = 0;
      }
      getFolderFile(folderID); // 响应事件
    });
  })


  // 新建文件夹函数
  const addNewFolder = async () => {
    if(isEd)return;
    isEd=true;
    let newFolder;
    newFolder=creatIng(folders,isCancel);
    await nextTick();
    // 焦点集中在新文件夹的输入框上
    const index = folders.value.indexOf(newFolder);
    const inputEl = document.getElementById(`folder-input-${index}`);
    labelFocus(inputEl);
  };

  const handleCancel = (index) => {
    isCancel = true;

    // 如果 isRe 为 false，则删除当前条目
    if (!isRe) {
      folders.value.splice(index, 1); // 删除当前条目
    } else {
      // 如果是重命名取消，不做任何修改，只关闭输入框
      const item = folders.value[index];
      if (item) {
        item.isEditing = false; // 设置为非编辑状态
        const inputEl = document.getElementById(`folder-input-${index}`);
        if (inputEl) {
          inputEl.blur(); // 关闭输入框
        }
      }
    }
  };



  const finishEditing = (item, index, isRename, isFolder) => {
    if (!item.isEditing || isCancel) return; // 防止重复处理

    // 文件名校验逻辑
    const msg = preJudge(isFolder ? folders.value : files.value, item);
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
    var result='';
    //
    if (!isRename) {
      createFolder(folderID, item, token, account, index, item.isEditing, inputEl);
      result='文件夹创建成功!';
    } else {
      if (isFolder) {
        renameFolder(folders.value, item, oldName, account, token, item.isEditing);
        result='文件夹重命名成功！';
        isRe=false;
      } else {
        // showLabelAlert(renameFile(files, item, oldName, account, token, item.isEditing));
      }
    }
    showLabelAlert(result);
    item.isEditing = false;
    isEd = false;

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
    } else if (fileIds.length === 1) {
      // 文件重命名
      index = files.value.findIndex((file) => file.id === fileIds[0].id);
      item = files.value[index];
    }
    oldName=item.name;
    // 设置为编辑模式
    item.isEditing = true;
    console.log("item:", item);
    nextTick(() => {
      const inputEl = document.getElementById(`folder-input-${index}`);
      if (inputEl) {
        labelFocus(inputEl); // 聚焦到输入框
      }
    });

  };

  const showDeleteModal = ref(false); // 控制模态框显示的状态

  const clickDel = (selectedIds) => {
    // 显示模态框而不是直接删除
    showDeleteModal.value = true;
  };

  // 确认删除
  const confirmDelete = () => {
    console.log(selectedIds);
    showLabelAlert(deleteItems(selectedIds, token, userInfo.account));
    const folderID = getCurrentFolderID();
    getFolderFile(folderID);
    showDeleteModal.value = false; // 关闭模态框
  };

  // 取消删除
  const cancelDelete = () => {
    showDeleteModal.value = false; // 关闭模态框
  };

  //收藏按钮
  // 判断是否所有选中的文件/文件夹已收藏
  const isAllSelectedFilesFavorited = computed(() => {
      const allSelectedFilesFavorited = files.value
          .filter(file => file.selected)  // 过滤选中的文件
          .every(file => file.isFavorite);  // 检查是否所有选中的文件都已收藏

      const allSelectedFoldersFavorited = folders.value
          .filter(folder => folder.selected)  // 过滤选中的文件夹
          .every(folder => folder.isFavorite);  // 检查是否所有选中的文件夹都已收藏

      // 返回是否文件和文件夹都已收藏
      return allSelectedFilesFavorited && allSelectedFoldersFavorited;
  });

  var account = userInfo.account;
  //var imgURL = userInfo.avatar;
  const markAsFavorite = () => {
      const newFavoriteState = isAllSelectedFilesFavorited.value ? 1 : 2;

      files.value.forEach(file => {
          if (file.selected) {
              const requestData = {
                  account: account,
                  file_id: file.ID,
                  is_favorite: newFavoriteState,
              };
              // console.log('Account:', account); // 打印 account 的值
              // console.log('File ID:', file.ID); // 打印 file.ID 的值
              // console.log('Is Favorite:', newFavoriteState); // 打印 newFavoriteState 的值
              fetch('http://localhost:8080/api/favoriteFile', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: localStorage.getItem('token'),
                  },
                  body: JSON.stringify(requestData),
              })
                  .then(response => response.json())
                  .then(data => {
                      console.log('Response Data:', data); // 打印响应体内容
                      if (data.status === 'SUCCESS') {
                          const favoriteStateFromMsg = data.msg.includes('true');
                          file.isFavorite = favoriteStateFromMsg;
                          console.log(`${file.name} 收藏状态已更新：${file.isFavorite ? '已收藏' : '未收藏'}`);
                      } else {
                          console.error(`更新收藏状态失败：${file.name}`, data.message);
                      }
                  })
                  .catch(error => {
                      console.error(`请求失败：${file.name}`, error);
                  });
          }
      });
      folders.value.forEach(folder => {
          if (folder.selected) {
              const requestData = {
                  account: account,
                  folder_id: folder.id,
                  is_favorite: newFavoriteState,
              };
              console.log('Account:', account); // 打印 account 的值
              console.log('Foler ID:', folder.id); // 打印 file.ID 的值
              console.log('Is Favorite:', newFavoriteState); // 打印 newFavoriteState 的值
              fetch('http://localhost:8080/api/favoriteFolder', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: localStorage.getItem('token'),
                  },
                  body: JSON.stringify(requestData),
              })
                  .then(response => response.json())
                  .then(data => {
                      console.log('Response Data:', data); // 打印响应体内容
                      if (data.status === 'SUCCESS') {
                          const favoriteStateFromMsg = data.msg.includes('true');
                          folder.isFavorite = favoriteStateFromMsg;
                          console.log(`${folder.name} 收藏状态已更新：${folder.isFavorite ? '已收藏' : '未收藏'}`);
                      } else {
                          console.error(`更新收藏状态失败：${folder.name}`, data.message);
                      }
                  })
                  .catch(error => {
                      console.error(`请求失败：${folder.name}`, error);
                  });
          }
      });
  };

  // 变更收藏按钮的图标，根据选中的文件是否已收藏来判断
  const favoriteButtonIcon = computed(() => {
      console.log('isAllSelectedFilesFavorited.value', isAllSelectedFilesFavorited.value);
      return isAllSelectedFilesFavorited.value ? favoriteIcon : unfavoriteIcon;
  });





</script>

<template>
  <div id="filebox">
    <div class="file_header">
      <p>我的文件</p>
      <div id="alert-container"></div> <!-- 中间的label容器 -->
      <button id="allSelected" style="margin-right: 15px;" @click="selectAll"><img src="../assets/全选.svg" alt="" style="width: 30px; height: 30px;"></button>
      <button id="addFolder" @click="addNewFolder">
        <img src="../assets/新建文件夹.svg" alt="" style="width: 30px; height: 30px;">
      </button>
      <button id="back" @click="goBackToParentFolder">
        <img src="../assets/回退.svg" alt="" style="width: 30px; height: 30px;">
      </button>
    </div>
    <div class="file_op">
      <div class="file-list">
        <!-- 文件夹列表 -->
        <div class="folder-item" v-for="(folder, index) in folders" :key="folder.id">
          <img src="../assets/已收藏文件.svg" alt="" v-if="folder.isFavorite" style="width: 20px;height: 20px;">
          <img :src=folderURL alt="文件夹图标" class="file-icon" />
          <template v-if="folder.isEditing">
            <input v-model="folder.name" :id="`folder-input-${index}`" class="file-input"
                   @blur="finishEditing(folder, index, isRe,isFolder)" @keydown.enter="finishEditing(folder, index, isRe,isFolder)" />
            <button @mousedown.prevent="handleCancel(index)">取消</button> <!-- 添加取消按钮 -->
          </template>
          <template v-else>
            <a href="" class="file-name" @click.prevent="getFolderFile(folder.id)">{{ folder.name }}</a>
            <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->
          </template>
        </div>
        <div class="file-item" v-for="file in files" :key="file.ID">
          <img src="../assets/已收藏文件.svg" alt="" v-if="file.Favorite" style="width: 20px;height: 20px;">
          <img :src="fileURL" alt="文件图标" class="file-icon" />
          <a href="" class="file-name">{{ file.FileName }}</a>
          <input type="checkbox" v-model="file.selected" class="file-checkbox" />
        </div>
      </div>
      <div class="file-operations" v-if="isMultipleSelected">
        <button><img src="../assets/下载.svg" alt="">下载</button>
        <button><img src="../assets/分享.svg" alt="">共享</button>
        <button @click="clickDel(selectedIds)"><img src="../assets/回收站.svg" alt="">删除</button>
        <button @click="markAsFavorite">
          <img :src="favoriteButtonIcon" alt="收藏按钮">收藏
        </button>
      </div>
      <div class="file-operations" v-else-if="isSingleSelected">
        <button @click="download(selectedIds)">
          <img src="../assets/下载.svg" alt="">下载
        </button>
        <button @click="reName(selectedIds)">
          <img src="../assets/重命名.svg" alt="">重命名
        </button>
        <button @click="share(selectedIds)">
          <img src="../assets/分享.svg" alt="">共享
        </button>
        <button @click="clickDel(selectedIds)">
          <img src="../assets/回收站.svg" alt="">删除
        </button>
        <button @click="markAsFavorite">
          <img :src="favoriteButtonIcon" alt="收藏按钮">收藏
        </button>
      </div>
    </div>
    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>您确定要删除选中的项目吗？</p>
        <button @click="confirmDelete">确认</button>
        <button @click="cancelDelete">取消</button>
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
    background-image: url("../assets/文件.svg");
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
    text-decoration:none;
  }
  .file-name:visited {
    color: black;
  }
  .file-name:hover{
    color: #007bff;
  }
  .file-checkbox {
    margin-left: auto; /* 文件名和复选框之间的间距 */
  }

  .file-operations{
    position: absolute;
    bottom: 0;
    display: inline-flex;
    width: 100%;
    z-index: 2;
    border-radius: 20px;
    background-color: white;
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
</style>
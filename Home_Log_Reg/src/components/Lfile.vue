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
    creatIng,showLabelAlert
  } from '../homepage/api.js'

  import favoriteIcon from '../assets/已收藏.svg';
  import unfavoriteIcon from '../assets/收藏.svg';
  //用户信息加载,不要重复写
  //包括name,account,avatar,intro,token(这个在userdata里，别的在userinfo里)
  const userData = JSON.parse(localStorage.getItem('userData'));
  var userInfo = userData.data.userInfo;
  let Stack = []; // 定义一个栈来存储，栈元素是一个二元组，第一个元素为文件夹，第二个元素为文件
  const eventBus = useEventBus("folder-update");
  const rootFolderData = JSON.parse(localStorage.getItem('rootFolderData'));
  let curPath=rootFolderData;
  const token = localStorage.getItem('token');

  var isCancel = false;
  var isEd=false;
  const isAllSelected = ref(false);

  //获取当前页面文件夹和文件
  var folders = ref([]);
  var files = ref([]);
  onMounted(async () => {
    Stack.length = 0;
    changeCurrentFolderID(1);
    await fetchSubInfo(Stack,userData.data.token, userInfo.account,1);
    folders.value = Stack[Stack.length - 1][0];
    files.value = Stack[Stack.length - 1][1];
  })

  const selectedCount = computed(() => {
    // 统计选中的文件和文件夹数量
    const filesSelected = files.value.filter(file => file.selected).length;
    const foldersSelected = folders.value.filter(folder => folder.selected).length;
    return filesSelected + foldersSelected;
  });

  const isSingleSelected = computed(() => {
    // 如果总选中数量为 1，返回 true
    return selectedCount.value === 1;
  });

  const isMultipleSelected = computed(() => {
    // 如果总选中数量大于 1，返回 true
    return selectedCount.value > 1;
  });

  const selectAll = () => {
    // 切换全选状态
    isAllSelected.value = !isAllSelected.value;

    // 设置所有文件和文件夹的选中状态为全选状态
    files.value.forEach(file => (file.selected = isAllSelected.value));
    folders.value.forEach(folder => (folder.selected = isAllSelected.value));
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

  const handleCancel=(index)=>{
    isCancel=true;
    folders.value.splice(index, 1); // 删除当前条目
  }


  // 完成文件夹编辑并调用接口创建文件夹
  const finishEditing = (file,index) => {
    if (!file.isEditing||isCancel) return; // 防止重复处理
    // 文件名校验逻辑
    const msg=preJudge(folders.value,file);
    console.log('editing:');
    if (msg.trim()!=='') {
      showLabelAlert(msg);
      file.isEditing = true;
      nextTick(() => {
        const inputEl = document.getElementById(`folder-input-${index}`);
        labelShake(inputEl);
      });
    }
    else{
      const account = userInfo.account; // 从 userData 获取 account
      const folderID = getCurrentFolderID();
      const inputEl = document.getElementById(`folder-input-${index}`);
      showLabelAlert('文件夹创建成功!');
      createFolder(folderID, file, token, account, index, file.isEditing, inputEl);
      getFolderFile(folderID);
      file.isEditing=false;
      isEd=false;
    }
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
                   @blur="finishEditing(folder, index)" @keydown.enter="finishEditing(folder, index)" />
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
        <button><img src="../assets/回收站.svg" alt="">删除</button>
        <button @click="markAsFavorite">
          <img :src="favoriteButtonIcon" alt="收藏按钮">收藏
        </button>
      </div>
      <div class="file-operations" v-else-if="isSingleSelected">
        <button><img src="../assets/下载.svg" alt="">下载</button>
        <button><img src="../assets/重命名.svg" alt="">重命名</button>
        <button><img src="../assets/分享.svg" alt="">共享</button>
        <button><img src="../assets/回收站.svg" alt="">删除</button>
        <button @click="markAsFavorite">
          <img :src="favoriteButtonIcon" alt="收藏按钮">收藏
        </button>
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

</style>
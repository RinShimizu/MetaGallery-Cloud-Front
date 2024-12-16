<script setup>
import {ref, computed, onMounted, toRaw} from 'vue';
import fileURL from '../assets/文件.svg';
import folderURL from '../assets/文件夹.svg';
import {useEventBus} from "@vueuse/core";
import {
  fetchSharedInfo, fetchShareSubInfo, searchInShare,
  showLabelAlert,
  unShareItems
} from "@/homepage/api.js";


const token = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData'));
var userInfo = userData.data.userInfo;
var account = userInfo.account;
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
  [...files.value, ...folders.value].forEach(item => (item.selected = newState));
};

const enterFolder = async (folder) => {
  currentFolderName=folder.folder_name;
  console.log("curPathName:" + currentFolderName);

  // 调用 API 获取子文件夹和文件
  const { subfolders, file } = await fetchShareSubInfo(userData.data.token, userInfo.account, currentFolderName, folder.ipfs_hash);

  // 更新 folders 和 files 的值
  folders.value = subfolders;
  files.value = file;
  Stack.push([toRaw(folders.value), toRaw(files.value)]);
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

</script>

<template>
  <div id="filebox">
    <div class="file_header">
      <p>我的共享</p>
      <div id="alert-container"></div> <!-- 中间的label容器 -->
      <button id="allSelected" style="margin-right: 15px;" @click="selectAll">
        <img src="../assets/全选.svg" alt="" style="width: 30px; height: 30px;">
      </button>
      <button id="back" @click="goBackToParentShareFolder">
        <img src="../assets/回退.svg" alt="" style="width: 30px; height: 30px;margin-right: -15px;">
      </button>
    </div>
    <div class="file_op">
      <div class="file-list">
        <!-- 文件夹列表 -->
        <div class="folder-item" v-for="(folder, index) in folders"  :key="'folder-' + index">
          <img :src=folderURL alt="文件夹图标" class="file-icon" />
          <span href="" class="file-name" @click.prevent="enterFolder(folder)">{{ folder.folder_name }}</span>
          <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->
        </div>
        <div class="file-item" v-for="file in files" :key="file.ID">
          <img :src="fileURL" alt="文件图标" class="file-icon" />
          <span href="" class="file-name">{{ file.FileName }}</span>
          <input type="checkbox" v-model="file.selected" class="file-checkbox" />
        </div>
      </div>
      <div class="file-operations" v-if="isAnyFileSelected">
        <button><img src="../assets/下载.svg" alt="">下载</button>
        <button @click="cancelShare"><img src="../assets/回收站.svg" alt="">取消共享</button>
        <button @click="markAsFavorite">
          <img src="../assets/收藏.svg" alt="">收藏
        </button>
      </div>
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
  #filebox{
    position: relative;
    height: calc(100vh - 60px);
    width: 90%;
    left: 0;
    top: 0;
  }
  p{
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-family: 幼圆;
    margin: 15px 0 0 15px ;
  }
  p::before{
    content: "";
    background-image: url("../assets/分享.svg");
    display: inline-block;
    width: 20px; /* 控制宽度 */
    height: 20px; /* 控制高度 */
    background-size: contain; /* 图片自适应大小 */
    background-repeat: no-repeat;
    background-position: center;
  }

  .file_op{
    position: relative;
    margin: 20px 30px;
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
  .file-item {
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between; /* 左右对齐 */
    padding: 8px;
    border-bottom: 1px solid #ddd; /* 分隔线 */
  }
  .file-icon {
    width: 20px;
    height: 20px;
    margin: 0 8px 0 12px; /* 图标和文件名之间的间距 */
  }
  .file-name {
    font-size: 16px;
    flex: 1; /* 文件名占用剩余空间 */
    text-decoration:none;
  }
  .file-name:visited {
    color: black;
  }
  .file-name:hover{
    color: #007bff;
  }
  .file-checkbox {
    margin-left: 8px; /* 文件名和复选框之间的间距 */
  }

  .file-operations{
    position: absolute;
    bottom: 0;
    display: inline-flex;
    width: 100%;
    z-index: 2;
    background-color: white;
    border-radius: 20px;
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

  .pages{
    display: flex;
    width: 100%;
    justify-content: center; /* 水平居中 */
    align-items: center;
    margin-top: 20px;
    gap: 15px;
  }
  .pages button{
    width: 30px;
    height: 30px;
    background-color: transparent;
    border: none;
  }
  .pages button:hover,.pages button.active{
    color: #4095E5;
  }
  #left:hover img{
    content:url("../assets/向左箭头h.svg");
  }
  #left.disabled img{
    content:url("../assets/向左箭头c.svg");
  }
  #left.disabled{
    pointer-events: none;
  }
  #right:hover img{
    content:url("../assets/向右箭头h.svg");
  }
  #right.disabled img{
    content:url("../assets/向右箭头c.svg");
  }
  #right.disabled{
    pointer-events: none;
  }
  #left img,#right img{
    height: 100%;
    width: 100%;
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
    background-image: url("../assets/分享.svg");
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

  #back {
    margin-left: 10px; /* 给返回按钮添加一点间隔 */
  }

  /* alert-container 样式 */
  #alert-container {
    flex: 1; /* 让其占据可用空间 */
    text-align: center; /* 文本居中 */
  }

  .folder-item {
    min-height: 40px;
    display: flex;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #ddd; /* 分隔线 */
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
</style>
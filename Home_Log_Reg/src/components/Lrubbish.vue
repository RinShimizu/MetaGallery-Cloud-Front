<script setup>
import {ref, computed, onMounted} from 'vue';
import fileURL from '../assets/文件.svg';
import folderURL from '../assets/文件夹.svg';
import {
  fetchDelSubInfo,
  recoverItems,
  showLabelAlert,
  completeDeleteItems,searchInCan,
  showBinFileOrFolderInfo, hideBinFileOrFolderInfo, fileOrFolderInfo, popupTop, popupLeft
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
  [...files.value, ...folders.value].forEach(item => (item.selected = newState));
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
      <button id="allSelected" style="margin-right: -15px;" @click="selectAll"><img src="../assets/全选.svg" alt="" style="width: 30px; height: 30px;"></button>
    </div>
    <div class="file_op">
      <div class="file-list">
        <!-- 文件夹列表 -->
        <div class="folder-item" v-for="folder in folders" :key="folder.id">
          <img :src=folderURL alt="文件夹图标" class="file-icon" />
            <span class="file-name"
                  @mouseover="showBinFileOrFolderInfo(folder.bin_id,folder.id, 'folder', token, userInfo.account,$event)"
                  @mouseout="hideBinFileOrFolderInfo">{{ folder.folder_name }}</span>
            <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->
        </div>
        <div class="file-item" v-for="file in files" :key="file.ID">
          <img :src="fileURL" alt="文件图标" class="file-icon" />
          <span class="file-name"
                @mouseover="showFileOrFolderInfo(file.ID, 'file', token, userInfo.account,$event)"
                @mouseout="hideFileOrFolderInfo">{{ file.FileName }}</span>
          <input type="checkbox" v-model="file.selected" class="file-checkbox" />
        </div>
      </div>
      <div class="file-operations" v-if="isAnyFileSelected">
        <button @click="clickRecover"><img src="../assets/恢复.svg" alt="">恢复</button>
        <button @click="clickDelete"><img src="../assets/回收站.svg" alt="">删除</button>
      </div>
    </div>
  </div>
  <div v-if="showRecoverModal" class="modal">
    <div class="modal-content">
      <h3>确定恢复选中的文件（夹）？</h3>
      <p>您可以在文件列表中查看恢复的文件（夹）</p>
      <button id="btn1" @click="confirmRecover">确 定</button>
      <button id="btn2" @click="cancelRecover">取 消</button>
    </div>
  </div>
  <div v-if="showDeleteModal" class="modal">
    <div class="modal-content">
      <h3>确定彻底删除选中的文件（夹）？</h3>
      <p>彻底删除后，你将无法找回该文件（夹）</p>
      <button id="btn3" @click="confirmDelete">确 定</button>
      <button id="btn4" @click="cancelDelete">取 消</button>
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
</template>

<style scoped>
#filebox{
  position: relative;
  height: calc(100vh - 60px);
  width: 90%;
  left: 0;
  top: 0;
}
.file_header p{
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-family: 幼圆;
  margin: 15px 0 0 15px ;
}
.file_header p::before{
  content: "";
  background-image: url("../assets/回收站.svg");
  display: inline-block;
  width: 20px; /* 控制宽度 */
  height: 20px; /* 控制高度 */
  margin-left: 15px;
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

#message{
  position: absolute;
  display: none;
  flex-direction: column;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: #8EE5EE7F 2px solid;
  width: 500px;
  height: 250px;
  z-index: 3;
  border-radius: 40px;
  background-color: white;
}
#message span{
  font-size: 20px;
  text-align: center;
  margin: 12% auto 10% auto;
}
.con{
  display: inline-flex;
  margin: auto auto;
  width: 100%;
  height: 50%
}
.con button{
  width: 150px;
  height: 60px;
  margin: 0 auto;
  background-color: #93d2f377;
  border-radius: 10px;
  border: #cccccc 1px solid;
  font-size: 15px;
}
.info-popup {
  position: absolute;
  top: 50px; /* 距离父元素顶部50px */
  left: 100px; /* 距离父元素左侧100px */
  background: white;
  color: #474343;
  padding: 10px;
  border-radius: 15px;
  font-size: 14px;
  font-family: 宋体;
  z-index: 100; /* 确保它在前面 */
  display: block; /* 确保它可以显示 */
  font-weight: bold; /* 加粗字体 */
  border: 2px solid #423f3f; /* 设置边界线，宽度为2px，颜色为黑色 */
}

/* alert-container 样式 */
#alert-container {
  flex: 1; /* 让其占据可用空间 */
  text-align: center; /* 文本居中 */
}



.file_header{
  position: relative;
  display: flex;
  height: 20px;
  margin: 15px 5px 5px 15px;
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
  background-image: url("../assets/回收站.svg");
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


#allSelected{
  margin-left: auto; /* 将按钮推到右侧 */
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
#btn3{
  position: relative;
  vertical-align: middle;
  height: 40px;
  width: 120px;
  font-size: 15px;
  background-color: red;
  color: white;
  border-radius: 5%;
  border: 1px solid red;
  transition-duration: 0.2s;
  margin: auto 30px;
}
#btn4{
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
#btn3:hover{
  background-color: white;
  color: red;
  border: 1px solid red;

}
#btn4:hover{
  color: black;
  border: 1px solid black;
}
</style>
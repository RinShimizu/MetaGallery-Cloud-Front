<script setup>
import {ref, computed, onMounted} from 'vue';
import fileURL from '../assets/文件.svg';
import folderURL from '../assets/文件夹.svg';
import { fetchDelSubInfo } from "@/homepage/api.js";
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

onMounted(async () => {
  Stack.length = 0;
  await fetchDelSubInfo(Stack,userData.data.token, userInfo.account);
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

  const showMessage = () => {
    var message = document.getElementById("message");
    message.style.display = "inline-flex";
  }
  const cancel = () => {
    var message = document.getElementById("message");
    message.style.display = "none";
  }
  const confirm = () => {
    var message = document.getElementById("message");
    message.style.display = "none";
  }

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
        <div class="folder-item" v-for="(folder, index) in folders" :key="folder.id">
          <img :src=folderURL alt="文件夹图标" class="file-icon" />
            <span href="" class="file-name">{{ folder.name }}</span>
            <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->
        </div>
        <div class="file-item" v-for="file in files" :key="file.ID">
          <img :src="fileURL" alt="文件图标" class="file-icon" />
          <span href="" class="file-name">{{ file.FileName }}</span>
          <input type="checkbox" v-model="file.selected" class="file-checkbox" />
        </div>
      </div>
      <div class="file-operations" v-if="isAnyFileSelected">
        <button><img src="../assets/恢复.svg" alt="">恢复</button>
        <button @click="showMessage"><img src="../assets/回收站.svg" alt="">删除</button>
      </div>
    </div>
  </div>
  <div id="message">
    <span>确认删除此文件（夹）吗</span>
    <div class="con">
      <button @click="confirm">确定</button>
      <button @click="cancel">取消</button>
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


</style>
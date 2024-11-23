<script setup>
  import { ref, computed,  nextTick, onMounted } from 'vue';
  import fileURL from '../assets/文件.svg';
  import folderURL from '../assets/文件夹.svg';
  import { fetchSubFileInfo } from '../homepage/api.js'
  import { getTopOfFileStack } from '../homepage/api.js'

  //用户信息加载,不要重复写
  //包括name,account,avatar,intro,token(这个在userdata里，别的在userinfo里)
  const userData = JSON.parse(localStorage.getItem('userData'));
  var userInfo = userData.data.userInfo;
  const rootFolderData = JSON.parse(localStorage.getItem('rootFolderData'));
  let curPath=rootFolderData;
  const token = localStorage.getItem('token');
  const folders = ref([
    // { name: '我的文件夹', icon: folderURL, selected: false, isEditing: false },
  ]);
  var isCancel = false;

  //获取文件夹内文件
  var files = ref([]);
  onMounted(async () =>{
    await loadFilesInFolder(rootFolderData.id); // 传入根目录的 ID
    await fetchSubFileInfo(userData.data.token, userInfo.account,1);
    files.value = getTopOfFileStack();
  })

  //判断是否选中
  const isAnyFileSelected = computed(() => {
    // 判断 files 或 folders 中是否有任何一个被选中
    return files.value.some(file => file.selected) || folders.value.some(folder => folder.selected);
  });

  // 加载文件夹下的文件（模拟）
  const loadFilesInFolder = (folderId) => {
    // 假设你通过文件夹 id 获取文件
    // 这里模拟一个文件加载过程，实际应该是调用API或从本地获取
    fetch(`http://localhost:8080/api/loadFolder/getChildrenInfo?account=${encodeURIComponent(userInfo.account)}&folder_id=${encodeURIComponent(folderId)}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    })
        .then(response => {
          if (!response.ok) throw new Error(`获取根目录文件夹失败: ${response.statusText}`);
          return response.json();
        })
        .then(data => {
          if (data.status === "FAILED") {
            console.log(data);
            alert('获取根目录文件夹失败: ' + data.msg);
          }
          else {
            console.log(data);
            folders.value = data.data.map(folder => ({
              id: folder.id,              // 文件夹 ID
              parent_id:folder.parent_id,
              name: folder.folder_name,   // 文件夹名称
              path: folder.path,          // 文件夹路径
              isFavorite: folder.is_favorite, // 是否收藏
              shared: folder.is_share,    // 是否分享
              icon: folderURL,         // 图标 (假设为固定值)
              selected: false,            // 默认未选中
              isEditing:false
            }));

            folders.value.sort((a, b) => a.name.localeCompare(b.name));

          }
        })
  };


  //alert
  const showLabelAlert = (msg) => {
    const container = document.getElementById('alert-container');

    // 创建提示框元素
    const alertLabel = document.createElement('div');
    alertLabel.className = 'alert-label';
    alertLabel.textContent = msg;

    // 添加提示框到容器中
    container.appendChild(alertLabel);

    // 1 秒后移除提示框
    setTimeout(() => {
      container.removeChild(alertLabel);
    }, 1000);
  };


  // 新建文件夹函数
  const addNewFolder = async () => {
    const newFolder = {
      name: '未命名文件夹', // 默认名称
      icon: folderURL,
      selected: false,
      isEditing: true,
    };
    isCancel=false;

    // 将新文件夹添加到数组末尾
    folders.value.unshift(newFolder);

    // 等待下一次 DOM 渲染
    await nextTick();

    // 焦点集中在新文件夹的输入框上
    const index = folders.value.indexOf(newFolder);
    const inputEl = document.getElementById(`folder-input-${index}`);
    if (inputEl) {
      inputEl.focus();
      inputEl.select();
    }
    console.log('inputEI1:', inputEl);
  };

  const handleCancel=(index)=>{
    isCancel=true;
    folders.value.splice(index, 1); // 删除当前条目
  }


  // 完成文件夹编辑并调用接口创建文件夹
  const finishEditing = (file,index) => {
    if (!file.isEditing) return; // 防止重复处理
    file.isEditing = false;
    if(isCancel)return;
    // 文件名校验逻辑
    if (!file.name.trim() || /[\/\\:*?"<>|]/.test(file.name)) {
      showLabelAlert('文件名不能为空或包含非法字符！');
      file.isEditing = true;
      nextTick(() => {
        const inputEl = document.getElementById(`folder-input-${index}`);
        console.log('inputEI3:', inputEl);
        if (inputEl) {
          inputEl.focus();
          inputEl.select();
          inputEl.classList.add('shake');
          setTimeout(() => inputEl.classList.remove('shake'), 300); // 移除震动效果

        }
      });
      return;
    }
    // 获取 token 和用户数据

    const account =userInfo.account; // 从 userData 获取 account
    // 调用创建文件夹
    console.log("parent_id"+curPath.id);
    console.log("rootFolderData"+rootFolderData.id);
    createFolder(curPath.id, file, token, account, index);
  };

  // 创建文件夹
  const createFolder = (folderPath, file, token, account,index) => {
    console.log('index2:', index);
    fetch('http://localhost:8080/api/createFolder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,  // 使用 token 进行授权
      },
      body: JSON.stringify({
        account: account,   // 使用存储在 localStorage 的用户数据
        parent_id: folderPath,      // 使用根路径和文件夹名称拼接得到完整路径
        folder_name: file.name,
      }),
    })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((errorText) => {
              throw new Error(`创建文件夹失败: ${response.status} ${response.statusText} - ${errorText}`);
            });
          }
          return response.json(); // 返回的数据为 JSON
        })
        .then((data) => {
          console.log("返回的数据：", data); // 查看返回的数据内容

          // 如果返回的状态是失败
          if (data.status === "FAILED") {
            console.log('文件夹创建失败，返回消息:', data.msg);
            showLabelAlert('文件夹创建失败: ' + data.msg);
            // 重新聚焦输入框并全选
            file.isEditing = true;
            nextTick(() => {
              const inputEl = document.getElementById(`folder-input-${index}`);
              console.log('inputEI2:', inputEl);
              if (inputEl) {
                inputEl.focus();
                inputEl.select();
                inputEl.classList.add('shake');
                setTimeout(() => inputEl.classList.remove('shake'), 300); // 移除震动效果

              }
            });
          } else {
            console.log('文件夹创建成功');

            showLabelAlert('文件夹创建成功!');
          }
        })

        .catch((error) => {
          alert('文件夹创建失败: ' + error.message);
        });
  };


  // 处理点击文件夹进入
  const handleFolderClick = (folder) => {
    // 更新当前路径
    curPath = folder;
    // 假设你有一个方法来获取文件夹下的文件
    loadFilesInFolder(folder.id);
  };


  // 返回上一级文件夹
  const goBackToParentFolder = () => {
    console.log(curPath.parent_id);
    if (curPath.parent_id){
      loadFilesInFolder(curPath.parent_id);
      fetch(`http://localhost:8080/api/loadFolder/getFolderInfo?account=${encodeURIComponent(userInfo.account)}&folder_id=${encodeURIComponent(curPath.parent_id)}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      })
          .then(response => {
            if (!response.ok) throw new Error(`获取上一级目录失败: ${response.statusText}`);
            return response.json();
          })
          .then(data => {
            if (data.status === "FAILED") {
              console.log(data);
              alert('获取上一级目录失败: ' + data.msg);
            }
            else {
              curPath= data.data;
            }
          })
    }
    else{
      showLabelAlert('当前目录为系统默认目录');
    }
  };


</script>

<template>
  <div id="filebox">
    <div class="file-header">
      <p>我的文件</p>
      <div id="alert-container"></div> <!-- 中间的label容器 -->
      <button id="addFolder" @click="addNewFolder">
        <img src="../assets/新建文件夹.svg" alt="">
      </button>
      <button id="back" @click="goBackToParentFolder">
        <img src="../assets/回退.svg" alt="" style="width: 20px; height: 20px;">
      </button>
    </div>
    <div class="file_op">
      <div class="file-list">
        <!-- 文件夹列表 -->
        <div class="file-item" v-for="(folder, index) in folders" :key="folder.id" @click="handleFolderClick(folder)">
          <img :src="folder.icon" alt="文件夹图标" class="file-icon" />

          <template v-if="folder.isEditing">
            <input v-model="folder.name" :id="`folder-input-${index}`" class="file-input"
                   @blur="finishEditing(folder, index)" @keydown.enter="finishEditing(folder, index)" />
            <button @mousedown.prevent="handleCancel(index)">取消</button> <!-- 添加取消按钮 -->
          </template>
          <template v-else>
            <span class="file-name">{{ folder.name }}</span>
            <input type="checkbox" v-model="folder.selected" class="file-checkbox"  @click.stop /> <!-- 文件夹复选框 -->
          </template>

        </div>

        <div class="file-item" v-for="(file, index) in files" :key="index">
          <img :src="fileURL" alt="文件图标" class="file-icon" />
          <a href="" class="file-name">{{ file.FileName }}</a>
          <input type="checkbox" v-model="file.selected" class="file-checkbox" />
        </div>
      </div>
      <div class="file-operations" v-if="isAnyFileSelected">
        <button><img src="../assets/下载.svg" alt="">下载</button>
        <button><img src="../assets/分享.svg" alt="">共享</button>
        <button><img src="../assets/回收站.svg" alt="">删除</button>
        <button><img src="../assets/收藏.svg" alt="">收藏</button>
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
    background-image: url("../assets/文件.svg");
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

  /* 主容器样式 */
  .file-header {
    display: flex; /* 使用 Flexbox */
    align-items: center;
    justify-content: space-between; /* 元素均匀分布 */
    gap: 10px; /* 控制间距 */
    margin: 15px 0 0 15px;
  }

  /* alert-container 样式 */
  #alert-container {
    flex: 1; /* 让其占据可用空间 */
    text-align: center; /* 文本居中 */
  }

  /* 调整按钮样式 */
  button {
    background: none; /* 去掉按钮背景 */
    border: none; /* 去掉按钮边框 */
    padding: 0; /* 去掉内边距 */
    cursor: pointer; /* 设置鼠标指针 */
  }

  button img {
    width: 24px; /* 调整按钮图标大小 */
    height: 24px;
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
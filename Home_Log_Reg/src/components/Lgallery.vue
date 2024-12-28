<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAllSharedItems, searchInGallery } from "@/homepage/api.js";
import { useEventBus } from "@vueuse/core";

const token = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData'));
var userInfo = userData.data.userInfo;
const items = ref([]);
const pageIndex = ref(1); // 默认选中第一个按钮
const totalPages = ref(1);

onMounted(() => {
  getAllSharedItems(token, pageIndex.value, userInfo.account)
      .then(data => {
        items.value = data.folders;
        totalPages.value = data.total_page;
      })
});

const selectButton = (index) => {
  pageIndex.value = index;
  getAllSharedItems(token, pageIndex.value, userInfo.account)
      .then(data => {
        items.value = data.folders;
      })
};
const selectIncrement = () => {
  pageIndex.value += 1;
  getAllSharedItems(token, pageIndex.value, userInfo.account)
      .then(data => {
        items.value = data.folders;
      })
}
const selectDecrement = () => {
  pageIndex.value -= 1;
  getAllSharedItems(token, pageIndex.value, userInfo.account)
      .then(data => {
        items.value = data.folders;
      })
}

const visiblePages = computed(() => {
  const pages = [];
  if (totalPages.value <= 5) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  }
  else {
    if (pageIndex.value + 4 <= totalPages.value) {
      pages.push(pageIndex.value, pageIndex.value + 1, '...', totalPages.value - 1, totalPages.value);
    }
    else {
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) {
        pages.push(i);
      }
    }
  }
  return pages;
});

const searchQuery = ref(""); // 当前搜索关键字
const eventBus1 = useEventBus("search-update");
const performSearch = (query) => {
  console.log(query);
  pageIndex.value = 1;
  searchInGallery(token, query, pageIndex.value)
      .then(data => {
        items.value = data.folders;
        totalPages.value = data.total_page;
      })
  //处理结果并显示
};

onMounted(() => {
  // 监听搜索内容的变化
  eventBus1.on(({ index, query }) => {
    if (index === 3) {
      searchQuery.value = query;
      console.log(`页面索引 ${index} 接收到搜索内容：`, query);
      if(query===''){
        //返回首页
        pageIndex.value = 1;
        getAllSharedItems(token, pageIndex.value, userInfo.account)
            .then(data => {
              items.value = data.folders;
              totalPages.value = data.total_page;
            })
      }
      else{
        performSearch(query); // 根据新的搜索内容获取数据
      }
    }
  });
});


</script>

<template>
  <div id="gallery_box">
    <div class="file_header">
      <p>画廊</p>
    </div>
    <div class="content_box">
      <div class="file_box">
        <router-link v-for="(item,index) in items" :key="index"
                     :to="{ name: 'Content', query: { item: JSON.stringify(item)} }" custom v-slot="{ navigate }">
          <div class="item" @click="navigate" role="link" :title=item.folder_name>
            <img id="cover" :src=item.cover_img alt="">
            <div class="item-info">
              <img id="avatar" :src="item.owner_account.avatar" alt="">
              <span>{{ item.folder_name }}</span>
            </div>
          </div>
        </router-link>
      </div>
      <div class="pages">
        <button id="left" :class="{ disabled: pageIndex === 1 }" @click="selectDecrement"><img src="../assets/向左箭头.svg" alt=""></button>
        <button v-for="(page, index) in visiblePages" :key="index" :id="page" :class="{ active: pageIndex === page }" @click="selectButton(page)">
          {{ page }}
        </button>
        <button id="right" :class="{ disabled: pageIndex === totalPages }" @click="selectIncrement"><img src="../assets/向右箭头.svg" alt=""></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#gallery_box{
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

.content_box{
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.file_box{
  display: grid;
  width: 100%;
  height: 90%;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  place-items: center;
  margin-top: 10px;
}
.item{
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 170px;
  width: 230px;
  cursor: pointer;
  border: #cccccc solid 1.5px;
  padding: 5px;
}
.item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(64, 149, 229, 0.15);
}
.item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.3); /* 透明黑色覆盖层 */
  opacity: 0; /* 初始状态下不显示 */
}
.item:hover::before {
  opacity: 1; /* 悬停时显示覆盖层 */
}
#cover{
  grid-area: a;
  height: 100%;
  width: 100%;
  object-fit: cover;
  overflow: hidden;
  justify-self: center;
  border-radius: 12px 12px 0 0;
}

.item-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding: 12px;
  background: white;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
}

#avatar{
  grid-area: b;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item span {
  grid-area: c;
  flex: 1;
  font-size: 15px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
</style>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAllSharedItems, searchInGallery } from "@/homepage/api.js";
import { useEventBus } from "@vueuse/core";

const token = localStorage.getItem('token');
const items = ref([]);
const pageIndex = ref(1); // 默认选中第一个按钮
const totalPages = ref(1);

  /*{
    "owner_account": {
    "account": "administer",
        "name": "MGCadm1H2a",
        "intro": "这个人很懒，什么都没有写",
        "avatar": "http://127.0.0.1:8080/resources/img/A.png"
  },
    "folder_name": "administer1",
      "ipfs_hash": "QmTs5VMPUjwnMTyiqSzVyroVxsy7MxcyvXqGSbkVQYoTkf",
      "intro": "nothing...",
      "cover_img": "http://127.0.0.1:8080/resources/img/cover_img/default.png",
      "pin_date": "2024-12-14 15:55:18"
  }*/

onMounted(() => {
  getAllSharedItems(token, pageIndex.value)
      .then(data => {
        items.value = data.folders;
        totalPages.value = data.total_page;
      })
});

const selectButton = (index) => {
  pageIndex.value = index;
  getAllSharedItems(token, pageIndex.value)
      .then(data => {
        items.value = data.folders;
      })
};
const selectIncrement = () => {
  pageIndex.value += 1;
  getAllSharedItems(token, pageIndex.value)
      .then(data => {
        items.value = data.folders;
      })
}
const selectDecrement = () => {
  pageIndex.value -= 1;
  getAllSharedItems(token, pageIndex.value)
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
        getAllSharedItems(token, pageIndex.value)
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
    <p>画廊</p>
    <div class="content_box">
      <div class="file_box">
        <router-link v-for="(item,index) in items" :key="index"
                     :to="{ name: 'Content', query: { item: JSON.stringify(item)} }" custom v-slot="{ navigate }">
          <div class="item" @click="navigate" role="link" :title=item.folder_name>
            <img id="cover" :src=item.cover_img alt="">
            <img id="avatar" :src=item.owner_account.avatar alt="">
            <span>{{item.folder_name}}</span>
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
  background-image: url("../assets/图片.svg");
  display: inline-block;
  width: 20px; /* 控制宽度 */
  height: 20px; /* 控制高度 */
  background-size: contain; /* 图片自适应大小 */
  background-repeat: no-repeat;
  background-position: center;
}
.content_box{
  position: relative;
  margin: 20px 30px;
  width: 100%; /* 列表宽度 */
  height: 90%;
  border: #cccccc 1px solid;
  border-radius: 20px;
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
  display: grid;
  position: relative;
  grid-template-rows: 7fr 3fr; /* 两行，每行高度相等 */
  grid-template-columns: 2fr 8fr; /* 第二行的两列，比例为 3:7 */
  grid-template-areas:
    "a a" /* 第一行只有一列，占据整个宽度 */
    "b c";
  width: 240px;
  height: 180px;
  overflow: hidden;
  padding: 5px;
}
.item:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border: #4095E5 1px solid;
  border-radius: 10px;
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
  transition: opacity 0.3s ease;
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
}
#avatar{
  grid-area: b;
  height: 45px;
  width: 45px;
  padding: 5px;
}
.item span {
  grid-area: c;
  height: 100%;
  width: 100%;
  display: block;
  align-content: center; /* 垂直居中 */
  overflow: hidden; /* 隐藏溢出的文本 */
  white-space: nowrap; /* 防止文本换行 */
  text-overflow: ellipsis; /* 显示省略号 */
  padding: 0 10px; /* 可选：添加一些内边距 */
  font-size: 18px;
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
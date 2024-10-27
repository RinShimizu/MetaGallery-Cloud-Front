<script setup>

</script>

<template>
  <div class="box">
    <p id="title">主页</p>
    <div class="container">
      <div class="summary">
        <button id="file">文件</button>
        <button id="pic">图像</button>
        <button id="audio">视频、音频</button>
        <button id="else">其他</button>
      </div>
      <div class="rubbishbox">
        <table>
          <thead>
          <tr>
            <th>最近删除</th>
            <th>时间</th>
          </tr>
          </thead>
          <tbody>
            <tr>
              <td>文件 1</td>
              <td>2024-10-01</td>
            </tr>
            <tr>
              <td>文件 2</td>
              <td>2024-10-02</td>
            </tr>
            <tr>
              <td>文件 3</td>
              <td>2024-10-03</td>
            </tr>
            <!-- 添加更多行 -->
          </tbody>
        </table>
      </div>
      <div class="folder">
        <table>
          <thead>
          <tr>
            <th>文件夹</th>
          </tr>
          </thead>
          <tbody>
            <tr>
              <td>文件 1</td>
            </tr>
            <tr>
              <td>文件 2</td>
            </tr>
            <tr>
              <td>文件 3</td>
            </tr>
            <!-- 添加更多行 -->
          </tbody>
        </table>
      </div>
      <div class="recent">
        <table>
          <thead>
          <tr>
            <th>最近打开</th>
            <th>时间</th>
          </tr>
          </thead>
          <tbody>
            <tr>
              <td>文件 1</td>
              <td>2024-10-01</td>
            </tr>
            <tr>
              <td>文件 2</td>
              <td>2024-10-02</td>
            </tr>
            <tr>
              <td>文件 3</td>
              <td>2024-10-03</td>
            </tr>
            <!-- 添加更多行 -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .container{
    background-color: #93d2f377;
    width: 1400px;
    height: 680px;
    border-radius: 20px;
  }
  #title{
    padding: 0;
    margin:0 0 10px 0;
  }
  .summary{
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 创建两列，平均分配空间 */
    grid-template-rows: repeat(2, 1fr);    /* 创建两行，平均分配空间 */
    gap: 20px; /* 可选：按钮之间的间距 */
    width: 380px; /* 根据需求设置整体宽度 */
    height: 380px; /* 根据需求设置整体高度 */
    position: absolute;
    background-color: white;
    border-radius: 20px;
    left: 14%;
    top: 8%;
    padding: 20px;
  }
  #file{
    position: relative;
    width: 100%;
    height: 100%;
    font-size: 16px;
    padding-left: 30px; /* 为图标留出空间 */
    background-color: #f0f0f0;
    text-align: left;
    border: 1px solid #333;
    border-radius: 8px; /* 按钮整体圆角 */
    overflow: hidden;
  }

  .rubbishbox{
    width: 35%; /* 容器宽度 */
    max-height: 300px; /* 设置最大高度，超过时滚动 */
    overflow-y: auto; /* 启用垂直滚动 */
    border: 1px solid #ddd; /* 可选：容器边框 */
    padding: 10px;
    box-sizing: border-box;
    position: absolute;
    left: 10%;
    bottom: 12%;
    background-color: white;
    border-radius: 20px;
  }

  .folder{
    width: 35%; /* 容器宽度 */
    height: 270px;
    overflow-y: auto; /* 启用垂直滚动 */
    border: 1px solid #ddd; /* 可选：容器边框 */
    padding: 10px;
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 12%;
    background-color: white;
    border-radius: 20px;
  }
  .recent{
    width: 35%; /* 容器宽度 */
    height: 270px; /* 设置最大高度，超过时滚动 */
    overflow-y: auto; /* 启用垂直滚动 */
    border: 1px solid #ddd; /* 可选：容器边框 */
    padding: 10px;
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    bottom: 12%;
    background-color: white;
    border-radius: 20px;
   }
  table {
    width: 100%;
    border-collapse: collapse; /* 合并表格边框 */
  }

  th, td {
    padding: 10px;
    border-bottom: 1px solid #ddd; /* 行底部边框 */
    text-align: left;
  }

  th {
    background-color: #f0f0f0; /* 表头背景色 */
    position: sticky;
    top: 0; /* 表头固定在顶部 */
    z-index: 1;
  }
</style>
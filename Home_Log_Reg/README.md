# 项目名称 MetaGallery-Cloud-frontend

A cloud disk web backend with a file gallery based on IPFS

基于 Vue 框架的云盘网页前端

## 简介

该项目是一个使用Vue框架开发的前端页面

## 项目结构

```
MetaGallery-Cloud-frontend/
├── public/          # 静态资源
├── src/
│   ├── assets/      # 项目资源文件
│   ├── components/  # 组件目录
│   ├── App.vue      # 根组件
│   └── main.js      # 项目入口文件
├── .gitignore       # Git 忽略规则
├── package.json     # 项目依赖配置
├── README.md        # 项目说明文件
└── vue.config.js    # Vue 配置文件
```

## 安装与运行

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或使用 yarn
yarn install
```

### 启动项目

```bash
npm run serve
# 或使用 yarn
yarn serve
```

在浏览器中访问 `http://localhost:8080` 查看项目效果。

### 构建项目

```bash
npm run build
# 或使用 yarn
yarn build
```

构建完成的文件将存放在 `dist/` 目录中，可用于生产环境部署。

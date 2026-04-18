<template>
  <div class="backend-layout">
    <el-container class="main-container">
        <Sidebar></Sidebar>
        <el-container>
            <el-header>
                <Navbar></Navbar>
            </el-header>
            <el-main class="main-content">
                <RouterView class="content-container"></RouterView>
            </el-main>
        </el-container>
    </el-container>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import { RouterView } from 'vue-router'
</script>

<style lang="scss" scoped>
/*
scoped 声明当前样式为局部样式 只对当前组件生效
scss 为scss语法 相比css 更加强大 可以使用变量 函数 嵌套 等高级功能
*/
.backend-layout {
  height: 100vh; /* 高度为视口高度 单位为vh  */
  .el-header {
    height: 74px !important;
  }
  .main-container {
    height: 100%;
    .content-container {
    padding: 20px;
    background-color: #fff;
    min-height: calc(100% - 74px);   // calc 函数：用于计算表达式的值，返回结果为字符串
  }
  }
}
</style>

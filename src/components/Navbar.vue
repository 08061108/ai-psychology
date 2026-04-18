<template>
  <div class="navbar">
    <div class="flex-box">
      <el-button @click="handleCollapse">
        <el-icon>
          <Expand />
        </el-icon>
      </el-button>
      <p class="page-title">{{route.meta.title}}</p>
    </div>
    <div class="flex-box">
      <el-dropdown @command="handleCommand">   <!-- el-dropdown - 下拉菜单容器组件 -->
        <!-- @command 事件：定义在 el-dropdown 上，当用户点击菜单项时触发，会 接收 command 属性的值作为参数 -->
        <div class="flex-box">
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />  <!-- el-avatar - 头像组件 -->
          <!-- src 属性：设置头像的图片路径 -->
          <p class="user-name">admin</p>
          <el-icon>              <!-- el-icon - 图标组件 -->
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>  
          <el-dropdown-menu>     <!-- el-dropdown-menu - 下拉菜单组件 -->
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>     <!-- el-dropdown-item - 下拉菜单项组件 -->
            <!-- command 属性：定义在 el-dropdown-item 上，用于设置当前菜单项的 命令值 -->
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin.js'
import { useRouter , useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { logout } from '@/api/admin'

const router = useRouter()
const route = useRoute()



const handleCommand = (command) => {
  if (command === 'logout') {
    // 处理退出登录逻辑
    ElMessageBox.confirm('确定退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 处理退出登录逻辑
      logout().then(() => {
        // 退出登录成功后，清除本地存储中的 token 和 userInfo
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        // 退出登录成功后，跳转到登录页
        router.push('/auth/login')
      })
    }).catch(() => {
      })
  }
}

const handleCollapse = () => {
  useAdminStore().toggleCollapse()
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #e5e7eb;
}
.flex-box {
  display: flex;
  align-items: center;
  justify-content: center;
  .page-title {
    margin-left: 20px;
    font-size: 26px;
    font-weight: bold;
    color: #1f2937;
  }
}
</style>

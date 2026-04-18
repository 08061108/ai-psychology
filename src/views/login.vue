<template>
  <div class="container">
    <div class="title">
      <div class="back-home" @click="handleBackHome">
        <el-icon>
          <Back />
        </el-icon>
        <span>返回首页</span>
      </div>
      <div class="title-text">
        <h2>登录您的账户</h2>
        <p>请输入您的登录信息</p>
      </div>
    </div>
    <div class="form-container">
      <el-form ref="ruleFormRef" :model="formData" label-position="top" :rules="rules">
        <el-form-item label="用户名或邮箱" prop="username">
          <el-input v-model="formData.username" size="large" placeholder="请输入用户名或邮箱"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" size="large" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="btn" type="primary" size="large" @click="handleLogin(ruleFormRef)">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="footer">
        <p>还没有账户？<router-link to="/auth/register">去注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref,reactive} from 'vue'
import { login } from '@/api/admin'
import router from '../router'

// 返回首页
const handleBackHome = () => {
  router.push('/home')
}

const ruleFormRef = ref(null)   // 登录表单实例

const formData = reactive({     // 登录表单数据
  username: '',
  password: ''
})

const rules = reactive({
  username: [
    {required: true, message: '请输入用户名或邮箱', trigger: 'blur'},
    //{ min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'}
  ]
})

const handleLogin = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid,fields) => {   // valid 根据rules验证结果 是校验状态 fields 是校验通过的字段对象
    if (valid) {
      login(formData).then(data =>{
        if(!data.token){
          return console.error('登录失败')
        }
        // 登录成功 保存token和用户信息到localStorage
        localStorage.setItem('token',data.token)   
        localStorage.setItem('userInfo',JSON.stringify(data.userInfo))  // localStorage 只能存储字符串
        // 判断是用户还是管理人员登录
        if(data.userInfo.userType === 2){
          router.push('/back/dashboard')
        }else{
          router.push('/')
        }
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  width: 384px;
  .title {
    .back-home {
      margin-bottom: 60px;
      cursor: pointer;
    }
    .title-text {
      text-align: center;
      h2 {
        font-size: 36px;
        margin-bottom: 10px;
      }
      p {
        font-size: 18px;
        color: #6b7280;
      }
    }
  }
  .form-container {
    margin-top: 30px;
    .btn {
      margin-top: 40px;
      width: 100%;
    }
    .footer {
      padding:30px;
      text-align: center;
    }
  }
}
</style>
<template>
  <div class="container">
    <div class="title">
      <div class="title-text">
        <h2>注册您的账户</h2>
        <p>请输入您的注册信息</p>
      </div>
    </div>
    <div class="form-container">
      <el-form label-position="top" :model="formData" :rules="rules" ref="submitFormRef">
        <el-form-item label="用户名或邮箱" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名或邮箱"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称(可选)"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号(可选)"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" placeholder="请确认密码" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="btn" type="primary" size="large" @click="submitForm(submitFormRef)">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { register } from '@/api/frontend'
import { ElMessage } from 'element-plus'
import {useRouter} from 'vue-router'
const router = useRouter()

// 注册表单数据
const formData = reactive({
    "username": "",
    "email": "",
    "nickname": "",
    "phone": "",
    "password": "",
    "confirmPassword": "",
    "gender": 0,
    "userType": 1 // 1: 普通用户, 2: 管理员
})

// 注册表单校验规则
const rules = reactive({
  username: [
    {required: true, message: '请输入用户名或邮箱', trigger: 'blur'},
    //{ min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 12, message: '密码长度必须在6到12个字符之间', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请确认密码', trigger: 'blur'},
    {min: 6, max: 12, message: '密码长度必须在6到12个字符之间', trigger: 'blur'}
  ]
})

// 注册表单实例
const submitFormRef = ref(null)

// 注册表单提交
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid,fields) => {   // valid 根据rules验证结果 是校验状态 fields 是校验通过的字段对象
    if (valid) {
      register(formData).then(({data}) =>{
        console.log(data)
        if(!data){
          // 注册成功后，跳转到登录页面
          router.push('/auth/login')
          ElMessage.success('注册成功')
        }
        if(data.code === "BUSINESS_ERROR"){
          ElMessage.error(data.message)
        }
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  width: 384px;
  .flex-box {
    display: flex;
    align-items: center;
  }
  .title {
    .title-text {
      text-align: center;
      h2 {
        font-size: 28px;
        margin-bottom: 10px;
      }
      p {
        font-size: 14px;
        color: #6b7280;
      }
    }
  }
  .form-container {
    margin-top: 20px;
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }
    .btn {
      margin-top: 20px;
      width: 100%;
    }
    .footer {
      padding: 20px;
      text-align: center;
    }
  }
}
</style>

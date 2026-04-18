<template>
  <el-dialog 
  :title="isEdit ? '编辑文章' : '新增文章'" 
  v-model="dialogVisible"           
  width="50%"
  @close="handleClose">
  <!-- v-model="props.modelValue" props.modelValue是一个只读属性 不能直接修改 此时需要使用computed属性来绑定 不能直接利用子组件事件触发父组件发送emit事件来修改props.modelValue属性值  -->
  <!-- 绑定dialogVisible属性到弹窗组件的v-model属性 -->
  <!-- 监听close事件 触发时调用handleClose函数 -->
    <el-form :model="formData" :rules="rules" ref="ruleFormRef">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="200"  show-word-limit clearable />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择文章分类">
          <el-option v-for="item in props.categories" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="文章摘要" prop="summary">
        <el-input type="textarea" v-model="formData.summary" placeholder="请输入文章摘要(可选)" maxlength="1000" show-word-limit :rows="4" clearable />
      </el-form-item>
      <el-form-item label="标签" prop="tags">
        <el-select v-model="formData.tagArray" multiple filterable allow-create style="width: 100%;" placeholder="请选择标签">
          <el-option v-for="item in commonTags" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="封面图片">
        <div class="cover-upload">
          <el-upload
            class="avatar-uploader"
            action="#"
            :before-upload="beforeUpload"
            :http-request="handleUploadRequest"
            :show-file-list="false"
            accept="image/*"
          >
            <div v-if="!imgURL" class="cover-placeholder">点击上传封面</div>
            <img v-else :src="imgURL" alt="封面图片" class="cover-image" />
          </el-upload>
          <el-button v-if="imgURL" type="danger" size="small" @click="handleRemove">移除封面</el-button>
        </div>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <RichTextEditor 
        v-model="formData.content"
        placeholder="请输入文章内容"
        :maxCharCount="5000"
        @change="handleContentChange"
        @create="handleEditorCreate"
        min-height="400px"
        />
      </el-form-item>
    </el-form>
    <div v-if="btnPreview">
      <h3>内容预览</h3>
      <div v-html="formData.content"></div>
    </div>
    <template #footer>
      <el-button @click="btnPreview = !btnPreview">{{btnPreview ? '隐藏效果' : '预览效果'}}</el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button @click="handleSubmit" type="primary" :loading="loading">{{isEdit ? '更新文章' : '创建文章'}}</el-button> <!--loading属性 用于显示加载动画 当 loading 为 true 时，按钮会显示加载动画，通常是一个旋转的加载图标 处于加载状态时，按钮会自动被禁用，防止用户重复点击 -->
    </template>
  </el-dialog>
</template>
<script setup>
import { ref,reactive,computed,nextTick,watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile, createArticle, updateArticle } from '@/api/admin'
import { fileBaseUrl } from '@/config/index.js'
import RichTextEditor from '@/components/RichTextEditor.vue'

// 新增按钮
/*
从父组件传值到子组件的整个过程
父组件 → v-model:modelValue → defineProps → props.modelValue → computed.get → el-dialog
*/
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  currentArticle: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue','success'])


const dialogVisible = computed({       // 弹窗组件的v-model属性 绑定到props.modelValue属性  当props.modelValue属性值改变时 弹窗组件的v-model属性也会改变改变
  get(){
    return props.modelValue
  },
  set(val){
    emit('update:modelValue',val)
  }
  }
)

const handleClose = () => {
  // 把表单重置为“初始值”
  // 这个初始值是在 el-form 组件第一次挂载（Mounted）完成时，它会抓取当时 formData 里的值作为基准。
  ruleFormRef.value.resetFields()
  emit('update:modelValue',false)
  // 需将formData中的tagArray属性重置为空数组
  formData.tagArray = []

  // 重置Id
  businessId.value = null
  // 重置封面图片
  handleRemove()


}

const formData = reactive({
  title:'',
  content:'',
  coverImage:'',
  categoryId: '',
  summary:'',
  tags: '',
  id:''
}
)
const rules = reactive({
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    {max:200, message:'文章标题最多200个字符', trigger:'blur'}
  ],
  categoryId: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }],
})

const commonTags = [
  '情绪管理', '焦虑', '抑郁', '压力', '睡眠', 
  '冥想', '正念', '放松', '心理健康', '自我成长',
  '人际关系', '工作压力', '学习方法', '生活技巧'
]

// 上传
const imgURL = ref('')

// 上传前校验 回调函数接收一个参数： file （要上传的文件对象）
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')  // startWith() 方法检查文件的类型是否以指定的前缀开头
  const isLt5MB = file.size / 1024 / 1024 < 5  // 检查文件大小是否小于5MB
  
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  if (!isLt5MB) {
    ElMessage.error('图片大小不能超过5MB')
    return false
  }
  return true  
}

const businessId = ref(null)
// beforeUpload 必须返回true或false 这样才能控制上传是否继续 上传成功后 才会执行handleUploadRequest函数
// handleUploadRequest 回调函数接收一个参数： file （要上传的文件对象）
const handleUploadRequest = async({ file }) => {       // 解构赋值 从file对象中提取file属性
  businessId.value = crypto.randomUUID()
  const fileRes = await uploadFile(file,{businessId:businessId.value})
  /*
  console.log({businessId.value:businessId.value}) 
  console.log(fileRes)
  */
  // 拼接图片完整地址
  imgURL.value = fileBaseUrl + fileRes.filePath
  // 赋值给formData.coverImage属性
  formData.coverImage = fileRes.filePath
}

// 移除封面图片
const handleRemove = () => {
  imgURL.value = ''
  formData.coverImage = ''
}

// 文章内容改变时 触发事件
const handleContentChange = (data) => {
  formData.content = data.html   // 因为存储到后端需要保留用户设置的格式（如字体、颜色、标题等） 所以需要将html属性赋值给formData.content属性
}
// 文章内容创建时 触发事件
const editorInstance = ref(null)
const handleEditorCreate = (editor) => {
  // 编辑时
  if(formData.content && editor){
    editorInstance.value = editor
    // 要保证渲染成功后 才能设置html内容
    nextTick(() => {
      editor.setHtml(formData.content)
    })
  }
  // 新增时
}

// 预览效果
const btnPreview = ref(false)
// 新增
const ruleFormRef = ref()
const loading = ref(false)

// 判断是否为编辑文章模式
const isEdit = computed(() => !!props.currentArticle?.id)
// 监听props.currentArticle属性值变化 当props.currentArticle属性值改变时 触发事件
watch(() => props.currentArticle, (newVal) => {
  if (newVal) {
    nextTick(() => {
      Object.assign(formData, newVal)   // 合并对象属性 若两个中有相同属性 后面的对象的属性会覆盖前面的对象的属性
      // 使用现有id
      businessId.value = newVal.id
      // 拿到图片地址
      imgURL.value = fileBaseUrl + newVal.coverImage
    })
  }
})

/*
const handleSubmit = (formEl) => {
  // if(!formEl) return
  formEl.validate((valid,fields) => {
    if(valid){
      loading.value=true
    }
  })
}
*/
const handleSubmit = () => {
  ruleFormRef.value.validate((valid,fields) => {
    if (valid){
      loading.value=true
    }
    console.log(formData)

    const submitData = {
        ...formData,
        tags: formData.tagArray.join(',')
        // 转换为逗号分隔的字符串
      }
      delete submitData.tagArray

    // 编辑文章时
    if(isEdit.value) {
      // 编辑文章
      updateArticle(props.currentArticle.id , submitData).then(res => {
        loading.value=false
        emit('success')
      })
    }else{
      // 新增文章时 需要将id属性赋值给submitData对象
      submitData.id = businessId.value
      createArticle(submitData).then(res => {
      loading.value=false
      emit('success')
    })
    }
  })
}


</script>

<style lang="scss" scoped>
.cover-placeholder {
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8b949e;
  background: #f6f8fa;
}
.cover-image {
  width: 200px;
  height: 200px;
  display: block; 
}
</style>

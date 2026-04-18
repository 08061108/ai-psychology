<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary" @click="handleEdit({})">新增</el-button>
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSearch" />
    <el-table :data="tableData" style="width:100%; margin-top:25px;">
      <el-table-column label="文章标题" width="250" fixed="left">
        <template #default="scope">
          <div style="display:flex; align-items:center;">
            <el-icon><timer /></el-icon>
            <span>{{scope.row.title}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="200">
        <template #default="scope">
          <div style="display:flex; align-items:center;">
            <el-icon><timer /></el-icon>
            <span>{{categoryMap[scope.row.categoryId]}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="authorName" label="作者" width="150" />
      <el-table-column prop="readCount" label="阅读量" width="150" />
      <el-table-column prop="updatedAt" label="发布时间" width="150" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <div style="display:flex; align-items:center;">
            <el-button text type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.status === 0 || scope.row.status === 2" text type="success" @click="handlePublish(scope.row)">发布</el-button>
            <el-button v-if="scope.row.status === 1" text type="warning" @click="handleUnPublish(scope.row)">下线</el-button>
            <el-button text type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination 
      layout="prev, pager, next"
      :page-size="pagination.size"
      :total="pagination.total"
      @change="handleChange"  
      style="margin-top: 25px;"
    />
    <!--@change事件 分页切换事件 触发时会传递当前页码作为参数 也就是当用户切换到不同的页码时 会将当前页码作为参数传递给handleChange函数 -->
    <ArticleDialog v-model:modelValue="dialogVisible" :categories="categories" :currentArticle="currentArticle" @success="handleSuccess"/>
  </div>
</template>
<script setup>
import { onMounted , ref , reactive } from 'vue'
import TableSearch from '@/components/TableSearch.vue'
import PageHead from '@/components/PageHead.vue'
import { categoryTree, articlePage, getArticleDetail, changeArticleStatus, deleteArticle } from '@/api/admin'
import ArticleDialog from '@/components/ArticleDialog.vue'
import { ElMessage,ElMessageBox } from 'element-plus'

const formItem = [
  {comp:'input', prop:'title', label: '文章标题', placeholder:'请输入文章标题',},
  {comp:'select', prop:'categoryID', label: '文章分类',placeholder:'请选择文章分类'},
  {comp:'select',prop:'status',label:'文章状态',placeholder:'请选择文章状态',options:[
    {label:'草稿',value:'0'},
    {label:'已发布',value:'1'},
    {label:'已删除',value:'2'}
  ]}
]

const pagination = reactive({
  currentPage:1,
  size:10,
  total:0
})

const tableData = ref([])

// 搜索文章
const handleSearch = async (formData) => {
  const parms = {
    ...pagination,    // ...对象名 对象展开语法（spread syntax） 用于 合并两个对象的属性 若两个中有相同属性 后面的对象的属性会覆盖前面的对象的属性
    ...formData
  }
  const {records,total} = await articlePage(parms)
  tableData.value = records
  pagination.total = total
}

const handleChange = (page) => {
  pagination.currentPage = page
  handleSearch()    // 切换页码时 重新查询对应页码的数据
}

const handleSuccess =() => {
  dialogVisible.value = false
  // 新增或编辑文章成功后 刷新表格数据
  handleSearch()
}

// 新增或编辑文章弹窗
const dialogVisible = ref(false)
const currentArticle = ref(null)
const handleEdit = (row) => {
  if(!row.id) {
    // 新增文章
    currentArticle.value = null
    dialogVisible.value = true
  }else{
    // 编辑文章
    getArticleDetail(row.id).then(res => {
      currentArticle.value = res
      dialogVisible.value = true
  })
  }
}

const handlePublish = (row) => {
  ElMessageBox.confirm(
    `确认发布文章${row.title}吗？`,
    '发布文章',
    {
      confirmButtonText: '确定发布',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    changeArticleStatus(row.id ,{status:1}).then(res => {
      ElMessage.success('发布成功')
      // 发布文章成功后 刷新表格数据
      handleSearch()
    })
  })
  .catch(() => {
    // 用户取消发布操作
    ElMessage.info('发布操作已取消')
  })
}

const handleUnPublish = (row) => {
  ElMessageBox.confirm(
    `确认下线文章${row.title}吗？`,
    '下线文章',
    {
      confirmButtonText: '确定下线',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    changeArticleStatus(row.id ,{status:0}).then(res => {
      ElMessage.success('下线成功')
      // 下线文章成功后 刷新表格数据
      handleSearch()
    })
  })
  .catch(() => {
    // 用户取消下线操作
    ElMessage.info('下线操作已取消')
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除文章${row.title}吗？`,
    '删除文章',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    deleteArticle(row.id).then(res => {
      ElMessage.success('删除成功')
      // 删除文章成功后 刷新表格数据
      handleSearch()
    })
  })
  .catch(() => {
    // 用户取消删除操作
    ElMessage.info('删除操作已取消')
  })
}

const categoryMap = reactive({})  // 分类映射表
// 分类列表 因为以后可能会需要在其他地方使用转换后的分类数据（例如在模板中显示分类列表），可以直接使用 categories
const categories = ref([])

onMounted(async() => {
  const data =await categoryTree()
  categories.value = data.map(item => {
    categoryMap[item.id] = item.categoryName        // 分类映射表 关联分类ID和分类名称
    return {
      label:item.categoryName,
      value:item.id
    }
  })
  formItem[1].options = categories.value
  handleSearch()
})
</script>
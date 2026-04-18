<template>
  <el-form :model="formData" ref="ruleFormRef">
    <el-row :gutter="24">           <!-- Vue 模板中不带 : 的属性值默认是字符串类型 -->
      <template v-for="item in formItemAttrs" :key="item.prop">
      <el-col v-bind="item.span">
        <el-form-item :label="item.label" :prop="item.prop">
        <component v-model="formData[item.prop]" :is="isComp(item.comp)" :placeholder="item.placeholder">
          <template v-if="item.comp === 'select'">
            <el-option label="全部" value="undefined" />
            <el-option 
            v-for="option in item.options" 
            :key="option.value"
            :label="option.label"
            :value="option.value" />
          </template>
        </component>  <!-- component 动态组件 可以根据comp动态渲染不同的组件-->
      </el-form-item>
      </el-col>
    </template>
    </el-row>
    <el-row>
      <el-form-item>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset(ruleFormRef)"> 重置</el-button>
    </el-form-item>
    </el-row>
  </el-form>
</template>
<script setup>
import { ref, reactive,computed } from 'vue'

const formData = reactive({})
const emit = defineEmits(['search'])   // 定义事件，用于触发父组件查询操作

const ruleFormRef = ref(null)
// console.log(ruleFormRef.value)


const props = defineProps({
  formItem: {
    type: Array,
    default: () => []
  }
})
const formItemAttrs = computed(() => {
  props.formItem.forEach(item => {
    item.span={xs:24 , sm:12, md:8, lg:6, xl:6}
  })
  return props.formItem
})
// isComp 函数 用于根据comp属性值返回对应的组件名称
const isComp = (comp) => {
  return {
    input: 'elInput',
    select: 'elSelect'
  }[comp]
}

const handleSearch = () => {
  emit('search', formData)
}
const handleReset = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
  emit('search', formData)
}
</script>
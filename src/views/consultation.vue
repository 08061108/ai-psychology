<template>
  <div class="consultation-container">
    <div class="sidebar">
      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <el-image :src="iconUrl" style="width: 25px; height: 25px;" alt="AI助手头像" />
        </div>
        <h3 class="assistant-name">圆圆AI助手</h3>
        <div class="online-status">
          <div class="status-dot"></div>在线服务中
        </div>
      </div>
      <div class="emotion-garden">
        <div class="garden-header">
          <div class="garden-title">情绪花园</div>
        </div>
        <div class="emotion-info">
          <div class="emotion-name">{{currentEmotion.primaryEmotion || '无'}}</div>
          <div class="emotion-score">{{currentEmotion.emotionScore || '无'}}</div>
        </div>
        <div class="warm-tips">
          <div class="emotion-status-text">
            <span class="status-label">今天</span>
            <span class="status-emotion">{{currentEmotion.isNegative ? '需要关注' : '特别满足'}}</span>
          </div>
          <div class="emotion-intensity">
            <span class="intensity-dots">
              <span class="dot" v-for="dot in 3" :key="dot" :class="{'active':getIntensityClass(currentEmotion.emotionScore) >= dot}"></span>
            </span>
            <span class="intensity-text">{{getRiskText(currentEmotion.emotionScore)}}</span>
          </div>
          <div class="warm-suggestion" v-if="currentEmotion.suggestion">
            <div class="suggestion-icon">💝</div>
            <div class="suggestion-content">
              <div class="suggestion-title">给您的小建议</div>
              <div class="suggestion-text">{{currentEmotion.suggestion}}</div>
            </div>
          </div>
          <!-- 治愈小行动 -->
          <div class="healing-actions" v-if="currentEmotion.improvementSuggestions.length > 0">
            <div class="actions-title">治愈小行动</div>
            <div class="actions-list">
              <div class="action-item" v-for="action in currentEmotion.improvementSuggestions" :key="action">
                <div class="action-icon">✨</div>
                <div class="action-text">{{action}}</div>
              </div>
            </div>
            <div></div>
          </div>
          <!-- 风险提示 -->
          <div class="risk-notice" v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1">
            <div class="notice-icon">🤗</div>
            <div class="notice-content">
              <div class="notice-title">温馨提示</div>
              <div class="notice-text">{{currentEmotion.riskDescription}}您的情绪状态存在风险，建议您及时咨询专业心理健康人员。</div>
            </div>
          </div>
        </div>
      </div>
      <div class="session-history">
        <h4 class="section-title">会话历史</h4>
        <div class="session-list">
          <div class="session-item" v-for="item in sessionList" :key="item.id" @click="handleSessionClick(item)">
            <div class="session-info">
              <div class="session-title">
                <span>{{item.sessionTitle}}</span>
                <div class="session-meta">
                  <span class="session-time">{{item.startedAt}}</span>
                </div>
                <div class="session-preview">{{item.lastMessageContent}}</div>
                <div class="session-stats">
                  <span><el-icon><ChatRound /></el-icon> {{item.messageCount || 0}}</span>
                  <span><el-icon><Clock /></el-icon> {{item.durationMinutes || 0}}分钟</span>
                </div>
              </div>
              <div class="session-actions">
                <el-button type="danger" text size="small" @click="handleDeleteSession(item.id)">
                  <el-icon>
                    <DeleteFilled />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-main">
      <div class="chat-header">
        <div class="header-left">
          <div class="chat-avatar">
            <el-image :src="iconUrl1" style="width: 30px; height: 30px;" />
          </div>
          <div class="chat-info">
            <h2>圆圆AI</h2>
            <p>您的贴心AI心理健康助手</p>
          </div>
        </div>
        <el-button circle title="新建对话" @click="createNewFrontendSession">
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </div>
      <div class="chat-messages">
        <div class="message-item ai-message" v-if="messages.length === 0">
          <div class="message-avatar">
            <el-image :src="iconUrl" style="width: 18px; height: 18px;" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>你好，我是圆圆，你也可以叫我小圆，有什么我能帮你的吗？</p>
            </div>
            <div class="message-time">刚刚</div>
          </div>
        </div>
        <!--显示会话消息-->
        <div class="message-item" v-for="item in messages" :key="item.id" :class="item.senderType === 1 ? 'user-message' : 'ai-message'">
          <div class="message-avatar">
            <el-image v-if="item.senderType === 1" :src="iconUrl2" style="width: 18px; height: 18px;" />
            <el-image v-if="item.senderType === 2" :src="iconUrl" style="width: 18px; height: 18px;" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <!--AI思考中-->
              <div v-if="item.senderType === 2 && isAiTying && !item.content" class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
              <!--AI错误消息-->
              <div v-else-if="item.isError" class="error-message">
                <p>{{item.content}}</p>
              </div>
              <!--AI正常消息-->
                <MarkdownRenderer v-else-if="item.senderType === 2 && !item.isError" :content="item.content" :isAiMessage="true" />
                <p v-else="item.content" v-html="formatMessageContent(item.content)"></p>
            </div>
            <div class="message-time">{{item.senderType === 2 && isAiTying ? '正在输入中...' : item.createdAt}}</div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <div class="input-container">
          <el-input 
          v-model="userMessage" 
          placeholder="您想对我说些什么..." 
          type="textarea"
          :rows="3"
          @keydown.enter="handleKeyDown"
          class="message-input"
          clearable />
          <div class="input-footer">
            <span>按Enter键发送，Shift+Enter换行</span>
            <span>{{userMessage.length}} / 500 </span>
          </div>
        </div>
        <el-button :disabled="!userMessage.trim() || userMessage.length > 500" class="send-btn" @click="sendMessage" type="primary">
          <el-icon>
            <Promotion />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createSession, getSessionList, deleteSession, getSessionMessages, getSessionEmotion } from '@/api/frontend'
import { ElMessage, ElMessageBox } from 'element-plus'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
// import {fetchEventSource} from '@microsoft/fetch-event-source'
import { createDeepSeekStream,analyzeEmotion,checkApiKey} from '@/utils/deepseek'


// 因为后端没有提供存入后续会话历史的接口 所以只有第一条信息 在创建会话时一起存入了后端
// 所以我只能暂时将它存在localStorage中
// ---------- localStorage 持久化工具 ----------
// 生成当前会话的存储 key（确保不同会话互不干扰）
const getStorageKey = (sessionId) => `chat_messages_${sessionId}`

// 保存消息到 localStorage
const persistMessages = (sessionId, messagesData) => {
  if (!sessionId) return
  try {
    localStorage.setItem(getStorageKey(sessionId), JSON.stringify(messagesData))
  } catch (e) {
    console.warn('localStorage 存储失败', e)
  }
}

// 从 localStorage 恢复消息
const restoreMessages = (sessionId) => {
  if (!sessionId) return null
  try {
    const cached = localStorage.getItem(getStorageKey(sessionId))
    return cached ? JSON.parse(cached) : null
  } catch (e) {
    console.warn('localStorage 读取失败', e)
    return null
  }
}

// 清除某个会话的缓存（删除会话时顺便清理）
const clearPersistedMessages = (sessionId) => {
  if (!sessionId) return
  localStorage.removeItem(getStorageKey(sessionId))
}

const iconUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href
const iconUrl1 = new URL('@/assets/images/like.png', import.meta.url).href
const iconUrl2 = new URL('@/assets/images/users.png', import.meta.url).href

// 控制初始欢迎消息的显示  当没有对话时 显示欢迎消息
const messages = ref([])

// 定义一个当前会话对象
const currentSession = ref(null)

// 创建一个临时会话对象 当组件挂载时以及用户点击新建对话按钮时 调用
const createNewFrontendSession = () => {
  const newSession = {
    sessionId: `temp_${Date.now()}`,  // 临时会话id 使用时间戳确保唯一
    status: 'Temp',
    sessionTitle: '新对话'
  }
  currentSession.value = newSession
  // 重置情绪花园
  currentEmotion.value = {
    primaryEmotion: '中性',
    emotionScore: 50,
    isNegative: false,
    riskLevel: 0,
    suggestion: '情绪状态平稳',
    improvementSuggestions: [],
    riskDescription : ''
  }
  // 清空消息列表，重新显示欢迎消息
  messages.value = []
}

// 处理用户输入 按下enter键发送消息
const handleKeyDown = (e) => {
  if(e.key === 'Enter' && !e.shiftKey){  // 按下enter键 且没有按下shift键 说明是发送消息
    e.preventDefault()                   // 阻止默认的enter键行为 - 换行
    sendMessage()
  }
}

// 用户消息
const userMessage = ref('')


// 判断AI是否正在回复
const isAiTying = ref(false)
// 发送消息
const sendMessage = () => {
  // 如果用户消息为空 则提示用户输入消息
  if(!userMessage.value.trim()){           // .trim() 移除字符串首尾的空格
    return ElMessage.error('请输入消息')
  }
  // 如果AI正在回复中 则提示用户稍后再试
  if(isAiTying.value){
    return ElMessage.error('正在回复中，请稍后再试')
  }
  // 如果消息不为空 且 AI也没有在回复 则要发送消息
  // 定义一个变量 用于存储用户消息
  const message = userMessage.value.trim()    
  // 清空用户消息框
  userMessage.value = ''
  // 判断当前会话是否是临时会话 如果是临时会话 则要创建后端会话对象
  if(currentSession.value.status === 'Temp'){
    startNewSession(message)
  }else{
    // 将用户消息添加到消息列表中
    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: message,
      createdAt: new Date().toLocaleString(),
    })
    persistMessages(currentSession.value.sessionId, messages.value)
    // 如果不是临时会话 则要将消息发送给当前会话
    startAIResponse(currentSession.value.sessionId)
  }
}

// 当为临时会话发送时 也就是用户首次在当前对话中发送消息时 将临时会话转换为后端正式会话 
const startNewSession = (message) => {
  // 构建会话参数
  const sessionParams = {
    initialMessage: message,
    sessionTitle: `圆圆AI助手 - ${new Date().toLocaleString()}`
  }
    // 发送会话参数给后端 后端创建正式会话对象 并将数据返回
    createSession(sessionParams).then(res =>{
      // 将后端返回的数据 保存到当前会话对象中
      const sessionData = {
        sessionId: res.sessionId,
        status: res.status,
        sessionTitle: sessionParams.sessionTitle
      }
      if(currentSession.value){
        // Object.assign() 方法用于合并两个或多个对象的属性值
        Object.assign(currentSession.value,sessionData)
      }else{
        // 如果没有当前会话 则要创建一个新会话
        createNewFrontendSession()
      }
      // 刷新会话历史列表
      getSessionPage()

      // 将用户消息添加到消息列表中
      messages.value.push({
        id: Date.now(),
        senderType: 1,
        content: message,
        createdAt: new Date().toLocaleString(),
      })

      // 开始流式对话
      startAIResponse(currentSession.value.sessionId)

    })
}

// 流式对话
const startAIResponse = (sessionId) => {
  if(isAiTying.value){
    return ElMessage.error('正在回复中，请稍后再试')
  }

  if (!checkApiKey()) {
    return
  }

  // 发送消息后 切换AI回复状态为true
  isAiTying.value = true

  // 创建一个AI消息对象 用来存储服务器返回的消息内容
  const aiMessage = {
    id: `ai_${Date.now()}_${Math.random().toString(36).substring(2)}`,// 生成 唯一 ID  ai_时间戳_随机数(生成36进制字符串但是不包含前缀0x也就是从第2位开始)
    senderType: 2,
    content: '',
    createdAt: new Date().toLocaleString(),
  }
  messages.value.push(aiMessage)  // 将AI消息添加到消息列表中

  // 构建对话历史（用于上下文理解）
  const conversationHistory = messages.value
    // 过滤掉当前AI占位符消息 只保留用户消息以及过往历史会话
    .filter(m => m.id !== aiMessage.id)
    // 映射为 DeepSeek API 所需的格式
    .map(m => ({
      role: m.senderType === 1 ? 'user' : 'assistant',
      content: m.content
    }))

  // 开始流式对话
  createDeepSeekStream(conversationHistory,
  // 传入回调函数 接收服务器返回的消息内容
  function onMessage(content){
    // 处理AI回复消息
    // 获取当前AI消息对象
    const currentAiMessage = messages.value[messages.value.length-1]
    // 检查当前AI消息对象是否存在 并且是AI消息
    if(currentAiMessage && currentAiMessage.senderType === 2){
      // 将服务器返回的消息内容 添加到当前AI消息对象的content属性中
      currentAiMessage.content += content
    }
  },
  // 传入回调函数 接收错误回复
  function onError(error){
    // 处理错误回复
    handleError(error)
  },
  // 传入回调函数 接收完成回复
  function onDone(){
    // 处理完成回复
    isAiTying.value = false
    // 保存当前会话的消息到 localStorage
    persistMessages(sessionId, messages.value)
    // 加载当前会话的情绪分析结果
    loadSessionEmotion(sessionId)
  }
  )
}

// 处理错误回复
const handleError = (error) => {
  const aiMessage = messages.value[messages.value.length - 1]
  if (aiMessage) {
    aiMessage.content = 'AI回复错误：请重试'
  }
  isAiTying.value = false
  ElMessage.error(error)
}

// 声明一个变量 用于存储当前会话的情绪分析结果
const currentEmotion = ref({
  primaryEmotion: '中性',
  emotionScore: 50,
  isNegative: false,
  riskLevel: 0,
  suggestion: '情绪状态平稳',
  improvementSuggestions: [],
  riskDescription : ''
})
// 获取情绪强度等级
const getIntensityClass = (score) =>{
  if (score >=61){
    return 3
  }else if (score >=31){
    return 2
  }else{
    return 1
  }
}
// 获取风险等级文本
const getRiskText = (level) => {
  switch(level){
    case 0:
      return '正常'
    case 1:
      return '需要关注'
    case 2:
      return '预警'
    case 3:
      return '严重'
    default:
      return '正常'
  }
}

const loadSessionEmotion = async (sessionId) => {
  // console.log(messages.value,'会话消息')

  // 将当前所有会话信息拿到 并转换为 "用户/AI：内容" 格式
  const conversationText = messages.value
    // 将对话文本转换为 "用户/AI：内容" 格式
    .map(m => `${m.senderType === 1 ? '用户' : 'AI'}：${m.content}` )
    // 将所有消息用 换行符 连接起来
    .join('\n')

  // console.log(conversationText,'会话消息')
  const result =await analyzeEmotion(conversationText)
  // console.log(result,'result')

  // 如果情绪分析结果存在 则要更新当前会话的情绪分析结果
  if(result){
    Object.assign(currentEmotion.value,result)
  }
}

// 会话历史列表
const sessionList = ref([])

// 获取会话历史列表
const getSessionPage = () => {
  getSessionList({pageNum: 1, pageSize: 10}).then(res =>{
    // console.log(res,'会话历史列表')
    // 将后端返回的会话列表 保存到会话历史列表中
    sessionList.value = res.records
  })
}
//- 点击历史会话时，通过接口获取该会话的详细消息
// 处理会话点击事件
const handleSessionClick = async (session) => {
  
  // 构建标准 sessionId
  const fullSessionId = `session_${session.id}`
  
  // 1. 先检查本地缓存
  const cached = restoreMessages(fullSessionId)
  if (cached) {
    messages.value = cached
  } else {
    // 2. 没有缓存才请求后端
    try {
      const res = await getSessionMessages(session.id)
      messages.value = res
      persistMessages(fullSessionId, res)
    } catch (e) {
      console.error('获取消息失败', e)
    }
  }

  /*
  // 点击会话后 切换当前会话为该会话
  // console.log(session,'点击会话')
  getSessionMessages(session.id).then(res => {
    // console.log(res,'会话消息')
    // 将后端返回的会话消息 保存到当前会话对象中
    messages.value = res
  })
  */
  // 加载会话的情绪分析结果
  loadSessionEmotion(session.id)

  // 将 currentSession.value 更新为这个新的会话对象，实现会话切换
  // 同时，直接使用会话列表中已有的基本信息构建会话对象
  const sessionData = {
        sessionId: "session_"+ session.id,
        status: 'ACTIVE',
        sessionTitle: session.sessionTitle
      }
      
      // 最后将构建的会话对象赋值给 currentSession.value ，实现会话切换
      currentSession.value = sessionData

}

// 处理会话删除事件
const handleDeleteSession = (sessionId) => {
  ElMessageBox.confirm('确定删除该会话吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteSession(sessionId).then(res =>{

      // ✅ 清除本地缓存
      clearPersistedMessages(`session_${sessionId}`)

      // console.log(res,'删除会话')
      // 删除成功后 刷新会话历史列表
      getSessionPage()
    })
  }).catch(() => {
    // 用户点击删除按钮 取消删除操作
    ElMessage.info('删除操作已取消')
  })
}

// 处理简单换行逻辑
const formatMessageContent = (content) => {
  return content.replace(/\n/g, '<br>')
}


// 组件挂载时 创建一个新的会话对象
onMounted(() => {
  createNewFrontendSession()
  getSessionPage()
})



</script>

<style lang="scss" scoped>
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;
  .sidebar {
    width: 320px;
    .ai-assistant-info {
      margin-bottom: 20px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 252, 248, 0.95) 100%
      );
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06),
        0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(251, 146, 60, 0.08);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      .breathing-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        animation: breathing 4s ease-in-out infinite;
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
        position: relative;
      }
      .assistant-name {
        font-size: 16px;
        font-weight: 700;
        background: linear-gradient(135deg, #fb923c, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        background-clip: text;
        margin: 0 0 12px;
      }
      .online-status {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #059669;
        font-size: 12px;
        font-weight: 600;
        .status-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
          box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
        }
      }
    }
    .session-history {
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      min-height: 250px;
      display: flex;
      flex-direction: column;
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .session-list {
        overflow-y: auto;
        max-height: 200px;
        scrollbar-width: thin;
        scrollbar-color: rgba(64, 150, 255, 0.3) transparent;
        .session-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          &:hover {
            background: #f8f9ff;
            border-color: #e6f0ff;
          }
          &.active {
            background: #e6f0ff;
            border-color: #4096ff;
          }
          .session-info {
            flex: 1;
            .session-title {
              font-weight: 500;
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              .session-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
                .session-time {
                  font-size: 12px;
                  color: #999;
                }
              }
              .session-preview {
                width: 200px;
                font-size: 12px;
                color: #666;
                margin-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .session-stats {
                display: flex;
                align-items: center;
                gap: 12px;
                span {
                  font-size: 12px;
                  color: #999;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }
            .session-actions {
              position: absolute;
              top: 10px;
              right: 12px;
            }
          }
        }
        .no-sessions-text {
          text-align: center;
          font-size: 14px;
          color: #999;
        }
      }
    }
    .emotion-garden {
      background: linear-gradient(
        135deg,
        #fef9e7 0%,
        #fcf4e6 50%,
        #f6f0e8 100%
      );
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      min-height: 300px;

      .garden-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;
        .garden-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #8b4513;
        }
      }
      .emotion-info {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(
          135deg,
          #ff9a9e 0%,
          #fecfef 50%,
          #fecfef 100%
        );
        color: #fff;
        .emotion-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
        }
        .emotion-score {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
        }
      }
      .warm-tips {
        text-align: center;
        margin-bottom: 16px;
        .emotion-status-text {
          margin-bottom: 12px;
          .status-label {
            font-size: 14px;
            color: #8b7355;
            margin-right: 8px;
          }
          .status-emotion {
            font-size: 16px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 16px;
            display: inline-block;
          }
        }
        .emotion-intensity {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          .intensity-dots {
            display: flex;
            gap: 4px;
            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #e0e0e0;
              transition: all 0.3s ease;
              &.active {
                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                transform: scale(1.2);
                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
              }
            }
          }
          .intensity-text {
            font-size: 12px;
            color: #8b7355;
            font-weight: 500;
          }
        }
        .warm-suggestion {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.95),
            rgba(255, 255, 255, 0.8)
          );
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          .suggestion-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .suggestion-content {
            text-align: left;
            flex: 1;
            .suggestion-title {
              font-size: 14px;
              font-weight: 600;
              color: #8b7355;
              margin-bottom: 6px;
            }
            .suggestion-text {
              font-size: 13px;
              color: #6b5b47;
              line-height: 1.5;
            }
          }
        }
        .healing-actions {
          margin-bottom: 16px;
          .actions-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 16px;
          }
          .actions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            .action-item {
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.9),
                rgba(255, 255, 255, 0.7)
              );
              border-radius: 12px;
              padding: 12px;
              display: flex;
              align-items: center;
              gap: 10px;
              border: 1px solid rgba(255, 255, 255, 0.5);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
              text-align: left;
              .action-icon {
                font-size: 14px;
                color: #ffd700;
                flex-shrink: 0;
              }
              .action-text {
                font-size: 12px;
                color: #6b5b47;
                line-height: 1.4;
                flex: 1;
              }
            }
          }
        }
        .risk-notice {
          background: linear-gradient(135deg, #fff9e6, #ffeaa7);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid rgba(255, 234, 167, 0.6);
          box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);
          .notice-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .notice-content {
            flex: 1;
            .notice-title {
              font-size: 14px;
              font-weight: 600;
              color: #d4840f;
              margin-bottom: 6px;
            }
            .notice-text {
              font-size: 13px;
              color: #b8740c;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }
  .chat-main {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 252, 250, 0.98) 100%
    );
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08),
      0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(251, 146, 60, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    .chat-header {
      background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      flex-shrink: 0;
      .header-left {
        display: flex;
        align-items: center;
        .chat-avatar {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }
        .chat-info {
          h2 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          p {
            font-size: 14px;
          }
        }
      }
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.02) 0%,
        rgba(255, 252, 248, 0.05) 100%
      );
      min-height: 0;
      max-height: calc(100vh - 200px);
      scrollbar-width: thin;
      scrollbar-color: rgba(251, 146, 60, 0.3) transparent;
      .message-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }
        &.ai-message {
          .message-avatar {
            background: linear-gradient(135deg, #fb923c, #f59e0b);
            box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
          }
        }
        &.user-message {
          .message-avatar {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          }
        }
        .message-content {
          max-width: 70%;
          .message-bubble {
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 252, 248, 0.95) 100%
            );
            border-radius: 16px;
            padding: 12px 16px;
            position: relative;
            animation: fadeInUp 0.4s ease-out;
            border: 1px solid rgba(251, 146, 60, 0.1);
            box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);
            .typing-indicator {
              display: flex;
              gap: 4px;
              padding: 8px 0;
              .typing-dot {
                width: 8px;
                height: 8px;
                background: #ccc;
                border-radius: 50%;
                animation: typing 1.5s ease-in-out infinite;
                &:nth-child(2) {
                  animation-delay: 0.2s;
                }
                &:nth-child(3) {
                  animation-delay: 0.4s;
                }
              }
            }
            /* 错误消息样式 */
            .error-message {
              background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
              border: 1px solid #f87171;
              border-radius: 12px;
              padding: 12px 16px;
              color: #991b1b;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }
          .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        }
      }
    }
    .chat-input {
      border-top: 1px solid rgba(251, 146, 60, 0.1);
      padding: 20px 24px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 252, 248, 0.7) 100%
      );
      backdrop-filter: blur(10px);
      flex-shrink: 0;
      .input-container {
        flex: 1;
      }
      .input-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #78716c;
        font-weight: 500;
      }
      .send-btn {
        height: 60px;
        width: 60px;
        border-radius: 16px;
        background: linear-gradient(
          135deg,
          #fb923c 0%,
          #f59e0b 100%
        ) !important;
        border: none !important;
        box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
        transition: all 0.3s ease;
      }
    }
  }
}
</style>
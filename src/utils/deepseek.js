import { ElMessage } from 'element-plus'

// const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
// const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'
// 代理服务器 URL
const PROXY_URL = 'http://localhost:3001'
// 系统提示词 - 用于引导 AI 助手的行为和响应
const systemPrompt = '你是"圆圆"，一个温暖友善的心理健康AI助手。你善于倾听用户的倾诉，给予情感支持和疏导。不要做诊断或治疗，只提供情感陪伴和建议。如果用户有严重的心理问题，请建议他们寻求专业帮助。'

const emotionAnalysisPrompt = `你是一个情绪分析专家。请分析以下对话内容的情绪状态，并返回一个JSON格式的情绪分析结果，不要包含任何其他内容：

{
  "primaryEmotion": "主要情绪（开心/平静/焦虑/悲伤/兴奋/疲惫/惊讶/困惑/愤怒/恐惧）",
  "emotionScore": 情绪强度分数(0-100),
  "isNegative": 是否为负面情绪(true/false),
  "riskLevel": 风险等级(0-正常, 1-关注, 2-预警, 3-危机),
  "suggestion": "给用户的温暖小建议（不超过50字）",
  "improvementSuggestions": ["改善建议1", "改善建议2", "改善建议3"],
  "riskDescription": "风险描述（如果isNegative为true 不要带有用户相关的词条 从亲昵的角度描述 而不是很生硬）"
}

请只返回JSON，不要有其他文字。`

// 流式对话 - 核心功能，用于 AI 聊天
export const createDeepSeekStream = async (messages, onMessage, onError, onDone) => {  // 接收到父组件传递的对话历史消息以及回调函数
  // 检查是否配置了 DeepSeek API Key
  if (!PROXY_URL) {
    onError('未配置 DeepSeek API Key，无法进行对话')
    return
  }
  // 发送流式请求
  const response = await fetch(`${PROXY_URL}/api/deepseek/stream`, {
    method: 'POST',  // 定义请求方法为 POST，用于发送流式请求
    headers: { 'Content-Type': 'application/json', }, // 设置请求头为 JSON 格式
    // body 请求体
    // 包含模型名称、消息列表和 stream 参数
    // 并将它们转换为 JSON 字符串格式 发送至 DeepSeek API 服务器
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },  // 系统提示词
        ...messages                                 // 对话历史消息
      ],
      stream: true,                                  // 开启流式响应
    })
  })

  // console.log(response, 'DeepSeek API 响应')
  // 检查是否成功响应
  if (!response.ok) {
    onError(`API 请求失败: ${response.status}`)
    return
  }

  // 检查是否为流式响应
  const contentType = response.headers.get('Content-Type') || ''
  if (!contentType.includes('text/event-stream') && !contentType.includes('stream')) {
    console.error('Content-Type:', contentType)
    onError('服务器返回非流式响应')
    return
  }

  // 处理流式会话
  const reader = response.body.getReader() // 获取流式响应的读取器
  const decoder = new TextDecoder()        // 创建 TextDecoder 实例，用于将字节流解为文本
  let buffer = ''                        // 用于存储流式响应的文本内容

  // 处理流式会话
  const processStream = async () => {
    try {
      // 无限循环直到检查到流式响应结束标志
      while (true) {
        // 从流式响应的读取器读取数据
        const { done, value } = await reader.read()  // 从读取的数据中将done和value解构出来
        // 当网络连接关闭时或者网络中没有更多数据时，done 为 true，跳出循环
        if (done) break
        // 解码并添加到缓冲区
        buffer += decoder.decode(value)     // 将字节流解码为文本并添加到缓冲区
        // console.log(buffer, 'buffer')
        // 但是缓冲区内容可能包含多行文本，需要按行分割
        // 按行分割缓冲区内容
        const lines = buffer.split('\n')
        // console.log(lines, 'lines')
        // 但是最后一行可能是不完整的，需要单独处理 也就是一条消息分两次发送回来的
        // 而且.split('\n')换行后 会将最后一行也包含在 lines 数组中
        // 所以需要从 lines 数组中移除最后一行，因为它是不完整的 要么是空行，要么是消息内容的一部分
        buffer = lines.pop()

        // 因为SSE格式 返回的数据中包含" data: " 标签，所以需要从 lines 数组中移除 "data:" 标签
        // 只有这样才能正确解析 JSON 数据
        for (const line of lines) {
          if (line.startsWith(`data: `)) {
            const data = line.slice(6)
            // 检查是否为流式响应的结束标志
            if (data === '[DONE]') {
              onDone()
              return
            }
            try {
              // 解析 JSON 数据
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                onMessage(content)
              }
            } catch (error) {
              onError(error.message || '解析 JSON 数据失败')
            }
          }
        }
      }
    } catch (error) {
      onError(error.message || '流式读取失败')
    }
  }
  processStream()
}

export const analyzeEmotion = async (conversationText) => {
  if (!PROXY_URL) {
    ElMessage.warning('未配置 DeepSeek API Key，无法进行情绪分析')
    return null
  }

  try {
    // fetch 非流式请求(向 DeepSeek API 发送请求) 等待服务器返回完整响应
    const response = await fetch(`${PROXY_URL}/api/deepseek/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: emotionAnalysisPrompt },
          { role: 'user', content: conversationText }
        ],
        stream: false,
      })
    })
    // console.log(response, '情绪分析API响应response')
    if (!response.ok) {
      ElMessage.error('情绪分析API请求失败')
      return null
    }
    // 将响应体解析为 JSON 格式的数据
    const data = await response.json()
    //console.log(data, '情绪分析API响应')
    // 不确定数据是否存在的都用可选链，防止程序崩溃。
    const resultText = data.choices?.[0]?.message?.content || ''
    // console.log(resultText, 'resultText1')
    try {
      if (resultText) {
        // console.log(JSON.parse(resultText), 'resultText2')
        return JSON.parse(resultText)
      }
    } catch (error) {
      // 如果解析失败，尝试提取JSON
      // 也就是可能其中包含了无法识别的字符 所以要用正则表达式提取JSON字符串
      const jsonMatch = resultText.match(/\{[\s\S]*\}/)   // .match() 方法返回一个数组，包含所有匹配的子字符串
      // console.log(JSON.parse(jsonMatch[0]), 'jsonText')
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return null
    }


  } catch (error) {
    ElMessage.error(error.message || '情绪分析失败')
    return null
  }
}

// 检查是否配置了 DeepSeek API Key
export const checkApiKey = () => {
  if (!PROXY_URL) {
    ElMessage.warning('未配置 DeepSeek API Key，请在 .env 文件中设置 VITE_DEEPSEEK_API_KEY')
    return false
  }
  return true
}
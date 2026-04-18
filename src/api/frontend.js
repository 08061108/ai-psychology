import service from '@/utils/request'
// 注册
export const register = (data) => {
  return service.post('/user/add', data)
}
// 创建对话
export const createSession = (data) => {
  return service.post('/psychological-chat/session/start', data)
}
// 分页查询对话
export const getSessionList = (params) => {
  return service.get('/psychological-chat/sessions', { params })
}
// 删除对话
export const deleteSession = (sessionId) => {
  return service.delete(`/psychological-chat/sessions/${sessionId}`)
}
// 查询对话消息
export const getSessionMessages = (sessionId) => {
  return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}
// 查询对话情绪分析结果
export const getSessionEmotion = (sessionId) => {
  return service.get(`/psychological-chat/session/${sessionId}/emotion`)
}
// 提交情绪日志
export const addEmotionDiary = (data) => {
  return service.post('/emotion-diary', data)
}
// 分页查询知识列表
export const getKnowledgeList = (params) => {
  return service.get('/knowledge/article/page', { params })
}
// 查询知识详情
export const getKnowledgeDetail = (id) => {
  return service.get(`/knowledge/article/${id}`)
}

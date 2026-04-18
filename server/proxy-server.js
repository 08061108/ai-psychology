import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

console.log('🔑 API Key 状态:', DEEPSEEK_API_KEY ? `已加载 (${DEEPSEEK_API_KEY.slice(0, 8)}...)` : '❌ 未配置');

app.post('/api/deepseek/stream', async (req, res) => {
  console.log('\n📥 收到流式请求');
  console.log('   请求体模型:', req.body.model);
  console.log('   消息数量:', req.body.messages?.length);
  console.log('   stream 参数:', req.body.stream);

  try {
    console.log('🚀 准备向 DeepSeek 发起请求...');
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`  // 添加 Bearer 认证头
      },
      body: JSON.stringify(req.body)
    });

    console.log('📡 DeepSeek 响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek 返回错误内容:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    console.log('✅ 连接成功，开始流式转发');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    response.body.on('error', (err) => {
      console.error('🔥 流转发错误:', err);
    });

    response.body.pipe(res);
  } catch (error) {
    console.error('🔥 代理 catch 捕获到错误:', error.message);
    console.error('   完整堆栈:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deepseek/analyze', async (req, res) => {
  console.log('📥 收到分析请求');
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 分析接口错误:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('🔥 分析接口错误:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ 代理已启动: http://localhost:${PORT}`);
  console.log('⏳ 等待前端请求...\n');
});
const express = require('express');
const { PythonShell } = require('python-shell');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS 설정 (모든 출처 허용 - 테스트용)
app.use(cors());

app.use(express.json());

// 간단한 테스트 엔드포인트
app.get('/test', (req, res) => {
  res.json({ message: 'CORS 테스트 성공' });
});

app.post('/ask', (req, res) => {
  const { question } = req.body;
  console.log('Received request:', req.body);
  PythonShell.run(
    path.join(__dirname, 'src/customer_center/app/chatbot/ask.py'),
    {
      args: [question],
      pythonPath: path.join(__dirname, 'src/customer_center/app/chatbot/venv/Scripts/python.exe')
    },
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '챗봇 처리 중 오류' });
      }
      const [faqAnswer, generatedAnswer] = JSON.parse(results[0]);
      res.json({ faq_answer: faqAnswer, generated_answer: generatedAnswer });
    }
  );
});

app.listen(8001, () => console.log('Server running on http://localhost:8001'));
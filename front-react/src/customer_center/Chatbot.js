import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import '../Css/customer_center/Chatbot.css';

function Chatbot() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendRequest = useCallback(
    debounce(async (question) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      try {
        // 사용자 메시지 추가
        setMessages((prev) => [...prev, { type: 'user', text: question, time }]);

        // FastAPI 서버에 요청
        const res = await axios.post('http://localhost:8001/ask', { question });

        const { faq_answer, generated_answer, source } = res.data;

        // FAQ 답변 추가
        setMessages((prev) => [
          ...prev,
          { type: 'bot', text: faq_answer || '적합한 FAQ 답변이 없습니다.', time, label: 'FAQ 답변' },
        ]);

        // AI 생성 답변이 있으면 추가
        if (generated_answer) {
          setMessages((prev) => [
            ...prev,
            { type: 'bot', text: generated_answer, time, label: 'AI 생성 답변' },
          ]);
        }
        setQuestion('');
      } catch (error) {
        console.error('챗봇 오류:', error);
        setMessages((prev) => [
          ...prev,
          { type: 'bot', text: '챗봇 서버에 연결할 수 없습니다.', time, label: '오류' },
        ]);
      }
    }, 500),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      sendRequest(question);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: '질문을 입력해주세요.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          label: '알림',
        },
      ]);
    }
  };

  return (
    <div className="chat-container">
      <h2>은행 고객센터 챗봇</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.type === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {msg.type === 'bot' && <div className="bot-label">{msg.label}</div>}
            <div className="message-content">
              <p>{msg.text}</p>
              <span className="message-time">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="질문을 입력하세요..."
        />
        <button type="submit">질문하기</button>
      </form>
    </div>
  );
}

export default Chatbot;
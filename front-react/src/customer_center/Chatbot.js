import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import styles from '../Css/customer_center/Chatbot.module.css'; // 모듈화된 사뱅스타일 CSS

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
        setMessages((prev) => [...prev, { type: 'user', text: question, time }]);

        const res = await axios.post('http://15.165.57.30:8001/ask/', { question });
        const { faq_answer, generated_answer } = res.data;

        setMessages((prev) => [
          ...prev,
          { type: 'bot', text: faq_answer || '적합한 FAQ 답변이 없습니다.', time, label: 'FAQ 답변' },
        ]);

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
    <div className={styles["chat-container"]}>
      <h2 className={styles["chat-title"]}>은행 고객센터 챗봇</h2>

      <div className={styles["chat-messages"]}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles["chat-message"]} ${msg.type === 'user' ? styles["user-message"] : styles["bot-message"]}`}
          >
            {msg.type === 'bot' && (
              <div className={styles["bot-label"]}>{msg.label}</div>
            )}
            <div className={styles["message-content"]}>
              <p>{msg.text}</p>
              <span
                className={
                  msg.type === 'user'
                    ? styles["message-time-user"]
                    : styles["message-time-bot"]
                }
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles["chat-input"]}>
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

import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import styles from '../Css/customer_center/Chatbot.module.css';

function Chatbot() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    const container = chatEndRef.current?.parentNode;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 150); // 렌더 후 레이아웃 안정될 때까지 기다림

    return () => clearTimeout(timeout);
  }, [messages.length]);

  const sendRequest = useCallback(
    debounce(async (question) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      try {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: question, time },
        ]);
        setLoading(true);

        const response = await axios.post(
          'http://localhost:8001/ask',
          { question: question },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const { answer } = response?.data || {};
        const answerText = answer || '현재 FAQ에 등록된 답변이 없습니다.';

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: answerText, time, label: 'FAQ 답변' },
        ]);
      } catch (error) {
        console.error(error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: 'bot',
            text: '오류가 발생했습니다. 다시 시도해주세요.',
            time,
            label: '알림',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }, 1000),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (question.trim()) {
      sendRequest(question);
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: 'bot',
          text: '질문을 입력해주세요.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          label: '알림',
        },
      ]);
    }

    setQuestion('');
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
        <button type="submit" disabled={loading}>질문하기</button>
      </form>
    </div>
  );
}

export default Chatbot;

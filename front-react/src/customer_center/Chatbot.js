import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import styles from '../Css/customer_center/Chatbot.module.css'; // 모듈화된 스타일 CSS

function Chatbot() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]); // 최적화를 위해 messages.length로 의존성 변경

  // 디바운스를 통해 질문 처리
  const sendRequest = useCallback(
    debounce(async (question) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      try {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: question, time },
        ]);
        setLoading(true); // 로딩 시작

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
        setLoading(false); // 로딩 종료
      }
    }, 1000),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // 질문이 비어있지 않은 경우에만 전송
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

    setQuestion(''); // 질문 입력 후 초기화
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

import React, { useState, useEffect, useRef } from 'react';
import { connectWebSocket, disconnectWebSocket, sendAudioChunk } from '../utils/websocketClient';
import { startRecording, stopRecording } from '../utils/audioRecorder';
import AudioPlayer from './AudioPlayer';

const VoiceBot = ({ isModalOpen }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (isModalOpen) {
      // 모달 열리면 소켓 연결
      const ws = connectWebSocket(handleMessage);
      wsRef.current = ws;
      setIsConnected(true);

      // 웰컴 메시지 추가
      setMessages(prev => [...prev, { type: 'text', content: '안녕하세요, Sound Bank입니다. 무엇을 도와드릴까요? "뱅크야"라고 하시면 추가 응답합니다.' }]);
    } else {
      // 모달 닫히면 소켓 끊기
      if (wsRef.current) {
        disconnectWebSocket(wsRef.current);
        wsRef.current = null;
      }
      setIsConnected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const handleMessage = (data) => {
    // 서버로부터 수신하는 데이터 처리
    const { type, content } = JSON.parse(data);
    setMessages(prev => [...prev, { type, content }]);
  };

  return (
    <div className="voice-bot">
      {messages.map((msg, idx) => (
        msg.type === 'text' ? (
          <div key={idx} className="bot-message">{msg.content}</div>
        ) : (
          <AudioPlayer key={idx} src={msg.content} />
        )
      ))}
    </div>
  );
};

export default VoiceBot;

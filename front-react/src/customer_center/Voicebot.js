import React, { useState, useRef, useEffect } from "react";
import styles from "../Css/customer_center/VoiceBot.module.css"; // 모듈화된 사뱅스타일

const VoiceBot = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
      if (event.data.includes("음성 파일")) {
        const audio = new Audio("http://localhost:8000" + event.data);
        audio.play();
      }
    };
    setSocket(ws);
    return () => ws.close();
  }, []);

  const toggleRecording = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        audioChunks.current = [];

        const formData = new FormData();
        formData.append("file", blob, "voice.webm");

        const response = await fetch("http://localhost:8000/upload-audio", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        setMessages((prev) => [...prev, result.message]);
        if (result.audio_path) {
          setMessages((prev) => [...prev, `음성 파일 경로: ${result.audio_path}`]);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const callHumanAgent = () => {
    alert("상담원 연결 요청 중...");
  };

  return (
    <div className={styles["voicebot-wrap"]}>
    <div className={styles["voicebot-container"]}>
      {/* 기존 클래스명: voicebot-title */}
      <h3 className={styles["voicebot-title"]}>음성봇 상담</h3>

      {/* 기존 클래스명: voicebot-button-wrap */}
      <div className={styles["voicebot-button-wrap"]}>
        {/* 기존 클래스명: btn-blue */}
        <button
          onClick={toggleRecording}
          className={styles["btn-blue"]}
        >
          {isRecording ? "녹음 중지" : "음성 입력"}
        </button>

        {/* 기존 클래스명: btn-gray */}
        <button
          onClick={callHumanAgent}
          className={styles["btn-gray"]}
        >
          상담원 호출
        </button>
      </div>

      {/* 기존 클래스명: voicebot-response */}
      <div className={styles["voicebot-response"]}>
        <h5>서버 응답</h5>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
    </div>
  );
};

export default VoiceBot;

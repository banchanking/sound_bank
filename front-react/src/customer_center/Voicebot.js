import React, { useState, useRef, useEffect } from "react";
import styles from "../Css/customer_center/VoiceBot.module.css";

const VoiceBot = () => {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8002/ws");
    wsRef.current = ws;
    console.log("웹소켓 연결 시도");

    ws.onopen = () => {
      console.log("WebSocket 연결 완료");
      ws.send(JSON.stringify({ type: "init", message: "client_connected" }));
    };

    ws.onerror = (error) => {
      console.error("WebSocket 연결 오류:", error);
      alert("웹소켓 연결 실패. 서버 상태를 확인하세요.");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("수신된 메시지:", data);

        if (data.type === "text") {
          setMessages((prev) => [...prev, { sender: "bot", text: data.text }]);

          if (data.text.includes("안녕하세요 Sound Bank입니다. 뱅크야 라고 하시면 응답해요")) {
            const welcomeAudio = new Audio("http://localhost:8002/static/welcome.mp3");
            welcomeAudio.play().catch((err) => console.error("오디오 재생 실패:", err));
          }
        } else if (data.type === "audio") {
          const audio = new Audio(`http://localhost:8002${data.audio_path}`);
          audio.play().catch((err) => console.error("오디오 재생 실패:", err));
        }
      } catch (err) {
        console.error("메시지 파싱 에러:", err);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket 연결 종료:", event.code, event.reason);
    };

    navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
      console.error("마이크 권한 요청 실패:", err);
      alert("마이크 권한이 필요합니다.");
    });

    return () => {
      ws.close();
      console.log("WebSocket 연결 해제");
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("file", audioBlob, "voice.wav");

        setMessages((prev) => [...prev, { sender: "user", text: "음성 메시지 전송됨" }]);

        try {
          const response = await fetch("http://127.0.0.1:8002/upload-audio", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          console.log("서버 응답:", result);

          if (result.text) {
            setMessages((prev) => [...prev, { sender: "user", text: result.text }]);
          }
          if (result.audio_path) {
            const replyAudio = new Audio(`http://localhost:8002${result.audio_path}`);
            replyAudio.play().catch((err) => console.error("오디오 재생 실패:", err));
          }
          if (result.answer) {
            setMessages((prev) => [...prev, { sender: "bot", text: result.answer }]);
          }
        } catch (uploadError) {
          console.error("음성 업로드 에러:", uploadError);
          alert("음성 전송에 실패했습니다.");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log("녹음 시작");
    } catch (err) {
      console.error("녹음 시작 실패:", err);
      alert("마이크 사용이 불가능합니다.");
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Sound_Bank 음성 상담</h3>
      <div className={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.sender === "bot" ? styles.botMessage : styles.userMessage}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <button
        onClick={toggleRecording}
        className={isRecording ? styles.stopButton : styles.recordButton}
      >
        {isRecording ? "녹음 중지" : "음성 질문하기"}
      </button>
    </div>
  );
};

export default VoiceBot;
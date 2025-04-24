import React, { useState, useRef, useEffect } from "react";

const VoiceBot = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws"); // 서버 주소 맞게 수정
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
      if (event.data.includes("음성 파일")) {
        // 서버에서 오디오 파일 경로를 받으면 해당 음성 파일을 자동 재생
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

        // 서버로 오디오 파일 전송
        const formData = new FormData();
        formData.append("file", blob, "voice.webm");

        // 서버에 오디오 파일을 업로드
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
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h3>음성봇 상담</h3>
      <button onClick={toggleRecording}>
        {isRecording ? " 녹음 중지" : " 음성 입력"}
      </button>
      <button onClick={callHumanAgent} style={{ marginLeft: "10px" }}>
        상담원 호출
      </button>
      <div style={{ marginTop: "20px" }}>
        <h5>서버 응답:</h5>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VoiceBot;

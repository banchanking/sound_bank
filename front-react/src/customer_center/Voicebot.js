import React, { useState, useRef, useEffect } from "react";

const VoiceBot = () => {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  // WebSocket 연결 및 첫 인사
  useEffect(() => {
    const ws = new WebSocket("ws://15.165.57.30:8002/ws");
    console.log("웹소켓이 연결되었습니다."); // 확인용 로그

    ws.onopen = () => {
      console.log("WebSocket 연결 완료");

      // 첫 번째 메시지 출력
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "안녕하세요. Sound_bank 입니다 무엇을 도와드릴까요?" },
      ]);

      // 첫 인사 음성 재생
      const welcomeAudio = new Audio("http://15.165.57.30:8002/static/welcome.mp3");
      welcomeAudio.play().catch((err) => console.error("Audio play error:", err));

      // WebSocket 연결이 완료되었음을 메시지로 UI에 반영
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "WebSocket 연결이 완료되었습니다." },
      ]);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "text") {
        setMessages((prev) => [...prev, { sender: "bot", text: data.text }]);
      } else if (data.type === "audio") {
        const audio = new Audio("http://15.165.57.30:8002" + data.audio_path);
        audio.play();
      }
    };

    ws.onclose = () => {
      console.log("WebSocket 연결 종료");
    };

    navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
      console.error("마이크 권한 요청 실패:", err);
    });

    return () => {
      ws.close();
    };
  }, []); // 'messages' 상태를 의존성 배열에서 제거

  // 음성 녹음 제어
  const toggleRecording = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });

        const formData = new FormData();
        formData.append("file", blob, "voice.webm");

        setMessages((prev) => [...prev, { sender: "user", text: "음성 메시지 전송됨" }]);

        const res = await fetch("http://15.165.57.30:8002/upload-audio", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();

        if (result.text) {
          setMessages((prev) => [...prev, { sender: "user", text: result.text }]);
        }

        if (result.audio_path) {
          const audio = new Audio("http://15.165.57.30:8002" + result.audio_path);
          audio.play();
        }
        if (result.answer) {
          setMessages((prev) => [...prev, { sender: "bot", text: result.answer }]);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ minHeight: 620, padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h3>Sound_Bank 음성 상담</h3>
      <div style={{ border: "1px solid #ccc", borderRadius: 10, padding: 15, height: 400, overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === "bot" ? "left" : "right", margin: "10px 0" }}>
            <div
              style={{
                display: "inline-block",
                padding: 10,
                borderRadius: 10,
                backgroundColor: msg.sender === "bot" ? "#f1f0f0" : "#aee1f9",
                maxWidth: "70%",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <button onClick={toggleRecording} style={{ marginTop: 15 }}>
        {isRecording ? "녹음 중지" : "음성 질문하기"}
      </button>
    </div>
  );
};

export default VoiceBot;

import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

const VoiceBot = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Web Speech API 또는 MediaRecorder로 녹음 시작/종료
  };

  const callHumanAgent = () => {
    // TODO: 상담원 연결 요청
    alert("상담원 연결 요청 중...");
  };

  return (
    <div className="voicebot-container">
      <h3>음성봇 상담</h3>
      <Button onClick={toggleRecording}>
        {isRecording ? "녹음 중지" : "음성 입력"}
      </Button>
      <Button onClick={callHumanAgent} variant="secondary">
        상담원 호출
      </Button>
      {audioUrl && <audio controls src={audioUrl} />}
    </div>
  );
};

export default VoiceBot;
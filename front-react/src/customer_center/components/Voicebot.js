import { useEffect, useRef } from "react";
import { startRecording, stopRecording } from "../utils/audioRecorder";
import { connectWebSocket, disconnectWebSocket } from "../utils/websocketClient";


const VoiceBot = ({ onResponse, isModalOpen }) => {
  const wsRef = useRef(null);
  const isRecordingRef = useRef(false);


  const handleMessage = (data) => {
    try {
      console.log("원시 WebSocket 데이터:", data);
      const parsed = JSON.parse(data);
      console.log("수신된 JSON 데이터:", parsed);

      if (parsed.status === "error") {
        console.error("서버 오류:", parsed.message);
        return;
      }

      let audioUrl = "";
      if (parsed.audio && parsed.content_type) {
        if (!["audio/wav", "audio/mpeg"].includes(parsed.content_type)) {
          console.error("지원되지 않는 오디오 형식:", parsed.content_type);
          return;
        }
        const audioData = new Uint8Array(parsed.audio.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
        const blob = new Blob([audioData], { type: parsed.content_type });
        audioUrl = URL.createObjectURL(blob);
        console.log("오디오 URL 생성:", audioUrl);
      }

      onResponse({ text: parsed.text || "", audioUrl });
    } catch (err) {
      console.error("WebSocket 메시지 파싱 오류:", err, "원시 데이터:", data);
    }
  };

  useEffect(() => {
    const handleError = (event) => {
      console.error("[WebSocket] 오류 발생:", event);
    };

    const handleClose = (event) => {
      console.log("[WebSocket] 연결 종료:", event.code, event.reason);
      setTimeout(() => {
        console.log("[WebSocket] 재연결 시도...");
        if (wsRef.current?.readyState !== WebSocket.OPEN && wsRef.current?.readyState !== WebSocket.CONNECTING) {
          const newWs = connectWebSocket((data) => handleMessage(data), {
            onError: handleError,
            onClose: handleClose,
          });
          wsRef.current = newWs;
          if (isModalOpen) {
            startRecording((data) => {
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                console.log(`전송된 오디오 데이터 크기: ${data.size} bytes`);
                wsRef.current.send(data);
              }
            });
          }
        }
      }, 3000);
    };

    const ws = connectWebSocket((data) => handleMessage(data), {
      onError: handleError,
      onClose: handleClose,
    });
    wsRef.current = ws;

    // 모달 열릴 때 녹음 시작
    if (isModalOpen) {
      startRecording((data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          console.log(`전송된 오디오 데이터 크기: ${data.size} bytes`);
          wsRef.current.send(data);
        }
      });
      isRecordingRef.current = true;
    }

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
        disconnectWebSocket(wsRef.current);
      }
      wsRef.current = null;
      if (isRecordingRef.current) {
        stopRecording();
        isRecordingRef.current = false;
      }
    };
  }, [onResponse, isModalOpen]);

  return null;
};

export default VoiceBot;
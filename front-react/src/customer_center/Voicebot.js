 import { useEffect, useRef } from "react";
// import { connectWebSocket, disconnectWebSocket } from "../utils/websocketClient";

 const VoiceBot = ({ onResponse }) => {

    return(
      <div>
        
      </div>
    )
 }
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const streamRef = useRef(null);

//   const startMicrophone = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       streamRef.current = stream;
//       const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
//       mediaRecorderRef.current = mediaRecorder;
//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
//           console.log(`전송된 오디오 데이터 크기: ${event.data.size} bytes`);
//           wsRef.current.send(event.data);
//         }
//       };
//       mediaRecorder.start(1000);
//       console.log("마이크 시작");
//     } catch (err) {
//       console.error("마이크 접근 오류:", err);
//     }
//   };

//   const stopMicrophone = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       mediaRecorderRef.current = null;
//     }
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     console.log("마이크 중지");
//   };

//   const handleMessage = (data) => {
//     try {
//       const parsed = JSON.parse(data);
//       console.log("수신된 JSON 데이터:", parsed);

//       // 초기 welcome 메시지 (배열 형식)
//       if (Array.isArray(parsed)) {
//         let text = "";
//         let audioUrl = "";
//         parsed.forEach((item) => {
//           if (item.type === "text") {
//             text = item.content;
//           } else if (item.type === "audio") {
//             audioUrl = item.content;
//           }
//         });
//         if (text || audioUrl) {
//           onResponse({ text, audioUrl });
//         }
//         return;
//       }

//       // 일반 응답 (main.py 형식)
//       if (parsed.status === "error") {
//         console.error("서버 오류:", parsed.message);
//         return;
//       }
//       let audioUrl = "";
//       if (parsed.audio && parsed.content_type) {
//         if (!["audio/wav", "audio/mpeg"].includes(parsed.content_type)) {
//           console.error("지원되지 않는 오디오 형식:", parsed.content_type);
//           return;
//         }
//         const audioData = new Uint8Array(parsed.audio.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
//         const blob = new Blob([audioData], { type: parsed.content_type });
//         audioUrl = URL.createObjectURL(blob);
//         console.log("오디오 URL 생성:", audioUrl);
//       }
//       onResponse({ text: parsed.text || "", audioUrl });
//     } catch (err) {
//       console.error("WebSocket 메시지 파싱 오류:", err);
//     }
//   };

//   useEffect(() => {
//     const ws = connectWebSocket((data) => handleMessage(data), {
//       onError: (error) => {
//         console.error("[WebSocket] 오류 상세:", error);
//       },
//       onClose: (event) => {
//         console.log("[WebSocket] 연결 종료:", event.code, event.reason);
//       },
//     });
//     wsRef.current = ws;
//     startMicrophone();

//    return () => {
//       disconnectWebSocket(wsRef.current);
//       wsRef.current = null;
//       stopMicrophone();
//     };
//   }, [onResponse]);

//   return null;
// };

 export default VoiceBot;
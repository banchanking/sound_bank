// import { useEffect, useRef } from "react";
// // import { connectWebSocket, disconnectWebSocket } from "../utils/websocketClient";

//  const VoiceBot = ({ onResponse }) => {

//   // WebSocket 연결 및 첫 인사
//   useEffect(() => {
//     const ws = new WebSocket("wss://sound-bank.duckdns.org:8002/ws");
//     console.log("웹소켓이 연결되었습니다."); // 확인용 로그

// //   const startMicrophone = async () => {
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //       streamRef.current = stream;
// //       const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
// //       mediaRecorderRef.current = mediaRecorder;
// //       mediaRecorder.ondataavailable = (event) => {
// //         if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
// //           console.log(`전송된 오디오 데이터 크기: ${event.data.size} bytes`);
// //           wsRef.current.send(event.data);
// //         }
// //       };
// //       mediaRecorder.start(1000);
// //       console.log("마이크 시작");
// //     } catch (err) {
// //       console.error("마이크 접근 오류:", err);
// //     }
// //   };

// //   const stopMicrophone = () => {
// //     if (mediaRecorderRef.current) {
// //       mediaRecorderRef.current.stop();
// //       mediaRecorderRef.current = null;
// //     }
// //     if (streamRef.current) {
// //       streamRef.current.getTracks().forEach((track) => track.stop());
// //       streamRef.current = null;
// //     }
// //     console.log("마이크 중지");
// //   };

//       // 첫 인사 음성 재생
//       const welcomeAudio = new Audio("https://sound-bank.duckdns.org/static/welcome.mp3");
//       welcomeAudio.play().catch((err) => console.error("Audio play error:", err));

// //       // 초기 welcome 메시지 (배열 형식)
// //       if (Array.isArray(parsed)) {
// //         let text = "";
// //         let audioUrl = "";
// //         parsed.forEach((item) => {
// //           if (item.type === "text") {
// //             text = item.content;
// //           } else if (item.type === "audio") {
// //             audioUrl = item.content;
// //           }
// //         });
// //         if (text || audioUrl) {
// //           onResponse({ text, audioUrl });
// //         }
// //         return;
// //       }

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === "text") {
//         setMessages((prev) => [...prev, { sender: "bot", text: data.text }]);
//       } else if (data.type === "audio") {
//         const audio = new Audio("https://sound-bank.duckdns.org" + data.audio_path);
//         audio.play();
//       }
//     };
//   }, []);
// //   useEffect(() => {
// //     const ws = connectWebSocket((data) => handleMessage(data), {
// //       onError: (error) => {
// //         console.error("[WebSocket] 오류 상세:", error);
// //       },
// //       onClose: (event) => {
// //         console.log("[WebSocket] 연결 종료:", event.code, event.reason);
// //       },
// //     });
// //     wsRef.current = ws;
// //     startMicrophone();

// //    return () => {
// //       disconnectWebSocket(wsRef.current);
// //       wsRef.current = null;
// //       stopMicrophone();
// //     };
// //   }, [onResponse]);

// //   return null;
// // };

//   // 음성 녹음 제어
//   const toggleRecording = async () => {
//     if (!isRecording) {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       audioChunks.current = [];

//       mediaRecorderRef.current.ondataavailable = (e) => {
//         audioChunks.current.push(e.data);
//       };

//       mediaRecorderRef.current.onstop = async () => {
//         const blob = new Blob(audioChunks.current, { type: "audio/webm" });

//         const formData = new FormData();
//         formData.append("file", blob, "voice.webm");

//         setMessages((prev) => [...prev, { sender: "user", text: "음성 메시지 전송됨" }]);

//         const res = await fetch("https://sound-bank.duckdns.org/upload-audio", {
//           method: "POST",
//           body: formData,
//         });
//         const result = await res.json();

//         if (result.text) {
//           setMessages((prev) => [...prev, { sender: "user", text: result.text }]);
//         }

//         if (result.audio_path) {
//           const audio = new Audio("https://sound-bank.duckdns.org" + result.audio_path);
//           audio.play();
//         }
//         if (result.answer) {
//           setMessages((prev) => [...prev, { sender: "bot", text: result.answer }]);
//         }
//       };

//       mediaRecorderRef.current.start();
//       setIsRecording(true);
//     } else {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };


//   return (
//     <div style={{ minHeight: 620, padding: 20, maxWidth: 600, margin: "0 auto" }}>
//       <h3>Sound_Bank 음성 상담</h3>
//       <div style={{ border: "1px solid #ccc", borderRadius: 10, padding: 15, height: 400, overflowY: "auto" }}>
//         {messages.map((msg, idx) => (
//           <div key={idx} style={{ textAlign: msg.sender === "bot" ? "left" : "right", margin: "10px 0" }}>
//             <div
//               style={{
//                 display: "inline-block",
//                 padding: 10,
//                 borderRadius: 10,
//                 backgroundColor: msg.sender === "bot" ? "#f1f0f0" : "#aee1f9",
//                 maxWidth: "70%",
//               }}
//             >
//               {msg.text}
//             </div>
//           </div>
//         ))}
//       </div>
//       <button onClick={toggleRecording} style={{ marginTop: 15 }}>
//         {isRecording ? "녹음 중지" : "음성 질문하기"}
//       </button>
//     </div>
//   );
// };

// export default VoiceBot;

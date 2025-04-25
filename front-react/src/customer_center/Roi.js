import React, { useState, useRef, useEffect } from "react";
import "../Css/customer_center/Roi.css";

function Roi() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [message, setMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 웹캠 스트리밍 시작
  useEffect(() => {
    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setMessage("웹캠 접근 실패: " + err.message);
      }
    }
    startWebcam();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // 이미지 캡처 (1000x700으로 리사이즈)
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    // 캔버스 크기를 1000x700으로 설정
    canvas.width = 1000;
    canvas.height = 700;

    // 비디오 프레임을 1000x700으로 리사이즈하여 그리기
    context.drawImage(video, 0, 0, 1000, 700);

    // 캔버스에서 이미지 추출
    canvas.toBlob((blob) => {
      const file = new File([blob], "captured_roi_image.jpg", { type: "image/jpeg" });
      setCapturedImage(file);
    }, "image/jpeg", 0.95);
  };

  // 서버로 이미지 업로드
  const handleUpload = async () => {
    if (!capturedImage) {
      setMessage("이미지를 캡처해주세요.");
      return;
    }
    const formData = new FormData();
    formData.append("file", capturedImage);
    try {
      const response = await fetch("https://d4b8-180-71-139-27.ngrok-free.app/ocr", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("서버 응답:", result);
      if (response.ok && result && result.status === "success") {
        setMessage("인증 성공: " + (result.message || "성공"));
      } else {
        setMessage("인증 실패: " + (result.message || "서버 응답 오류"));
      }
    } catch (error) {
      setMessage("통신 실패: " + error.message);
    }
  };

  return (
    <div className="roi-container">
      <h1 className="roi-title">주민등록증 인증 (웹캠)</h1>

      {/* 웹캠 스트리밍 및 ROI 오버레이 */}
      <div className="webcam-container">
        <video ref={videoRef} autoPlay className="webcam" width="1280" height="720" />
        <div className="roi-overlay" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 캡처 버튼 */}
      <button
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition mb-4"
        onClick={handleCapture}
      >
        이미지 캡처
      </button>

      {/* 캡처된 이미지 미리보기 */}
      {capturedImage && (
        <div className="preview-container">
          <img
            src={URL.createObjectURL(capturedImage)}
            alt="Captured ROI"
            className="w-40 h-28 object-contain border rounded shadow"
          />
        </div>
      )}

      {/* 업로드 버튼 */}
      <button
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        onClick={handleUpload}
      >
        확인
      </button>

      {/* 메시지 출력 */}
      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm border">
          {message}
        </div>
      )}
    </div>
  );
}

export default Roi;
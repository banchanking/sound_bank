import React, { useState, useRef, useEffect } from "react";
import styles from "../Css/customer_center/Roi.module.css"; // 모듈화된 CSS

function Roi() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [message, setMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 700;
    context.drawImage(video, 0, 0, 1000, 700);

    canvas.toBlob((blob) => {
      const file = new File([blob], "captured_roi_image.jpg", { type: "image/jpeg" });
      setCapturedImage(file);
    }, "image/jpeg", 0.95);
  };

  const handleUpload = async () => {
    if (!capturedImage) {
      setMessage("이미지를 캡처해주세요.");
      return;
    }
    const formData = new FormData();
    formData.append("file", capturedImage);

    try {
      const response = await fetch("https://06e8-180-71-139-27.ngrok-free.app/ocr", {

        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result?.status === "success") {
        setMessage("인증 성공: " + (result.message || "성공"));
      } else {
        setMessage("인증 실패: " + (result.message || "서버 응답 오류"));
      }
    } catch (error) {
      setMessage("통신 실패: " + error.message);
    }
  };

  return (
    <div className={styles["roi-container"]}>
      <h2 className={styles["roi-title"]}>주민등록증 인증 (웹캠)</h2>

      <div className={styles["webcam-wrap"]}>
        <div className={styles["webcam-box"]}>
          <video ref={videoRef} autoPlay className={styles["webcam"]} />
          <div className={styles["roi-overlay"]} />
          <canvas ref={canvasRef} className={styles["hidden"]} />
        </div>

        {capturedImage && (
          <div className={styles["preview-container"]}>
            <img
              src={URL.createObjectURL(capturedImage)}
              alt="Captured ROI"
              className={styles["preview-img"]}
            />
          </div>
        )}
      </div>

      <button onClick={handleCapture} className={styles["btn-green"]}>
        이미지 캡처
      </button>
      <button onClick={handleUpload} className={styles["btn-blue"]}>
        확인
      </button>

      {message && (
        <div className={styles["message-box"]}>{message}</div>
      )}
    </div>
  );
}

export default Roi;

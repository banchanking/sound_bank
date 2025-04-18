import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import "../Css/customer_center/WebcamIdAuth.css";

function Roi() {
  const [message, setMessage] = useState("");
  const [userConsent, setUserConsent] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const webcamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const handleConsentChange = (e) => {
    setUserConsent(e.target.checked);
  };

  const startWebcam = () => {
    if (userConsent) {
      setShowWebcam(true);
      setCapturedImage(null);
      setMessage("");
    } else {
      setMessage("웹캠 사용 동의가 필요합니다.");
    }
  };

  // 웹캠 중지 함수
  const stopWebcam = () => {
    setShowWebcam(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  // 이미지 캡처 함수
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        stopWebcam();
        performOCR(imageSrc);
      }
    }
  }, [webcamRef]);

  // 실시간 객체 인식 시작 함수
  const startObjectDetection = useCallback(() => {
    if (!webcamRef.current) return;
    
    // 기존 인터벌 제거
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // 실시간 객체 인식 인터벌 설정 (약 500ms 마다)
    detectionIntervalRef.current = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          detectIdCard(imageSrc);
        }
      }
    }, 500);
  }, [webcamRef]);

  // 신분증 감지 함수
  const detectIdCard = async (imageSrc) => {
    if (!imageSrc) return;

    try {
      // Base64 이미지를 Blob으로 변환
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append("file", blob, "webcam-frame.jpg");

      // YOLOv8 모델 API 호출 (객체 인식)
      const detectResponse = await fetch("https://53f7-180-71-139-27.ngrok-free.app/detect", {
        method: "POST",
        body: formData,
      });

      if (detectResponse.ok) {
        const result = await detectResponse.json();
        
        // 신분증이 감지되면 자동으로 캡처
        if (result && result.detections && Array.isArray(result.detections)) {
          const idCard = result.detections.find(
            det => det.class === "id_card" && det.confidence > 0.7
          );
          
          if (idCard) {
            console.log("신분증 감지됨, 자동 캡처 수행");
            capture();
          }
        }
      }
    } catch (error) {
      console.error("객체 인식 오류:", error);
    }
  };

  // OCR 처리 함수
  const performOCR = async (imageSrc) => {
    try {
      setProcessing(true);
      
      // Base64 이미지를 Blob으로 변환
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append("file", blob, "id-card-capture.jpg");

      // OCR API 호출
      const ocrResponse = await fetch("https://53f7-180-71-139-27.ngrok-free.app/ocr", {
        method: "POST",
        body: formData,
      });
      
      const result = await ocrResponse.json();
      console.log("OCR 서버 응답:", result);
      
      if (ocrResponse.ok && result && result.status === "success") {
        setMessage("인증 성공: " + (result.message || "성공"));
      } else {
        setMessage("인증 실패: " + (result.message || "서버 응답 오류"));
      }
    } catch (error) {
      setMessage("OCR 처리 실패: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // 웹캠이 시작되면 객체 인식 시작
  useEffect(() => {
    if (showWebcam) {
      // 웹캠이 로드되는데 잠시 시간이 필요하므로 약간의 지연 후 객체 인식 시작
      const timer = setTimeout(() => {
        startObjectDetection();
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    }
  }, [showWebcam, startObjectDetection]);

  return (
    <div className="webcam-id-auth-container">
      <h1 className="title">웹캠 신분증 인증</h1>
      
      {/* 웹캠 동의 섹션 */}
      <div className="consent-section">
        <label className="consent-label">
          <input 
            type="checkbox" 
            checked={userConsent} 
            onChange={handleConsentChange}
            className="consent-checkbox"
          />
          웹캠 사용 및 신분증 촬영에 동의합니다.
        </label>
        {!showWebcam ? (
          <button 
            className="webcam-button"
            onClick={startWebcam}
            disabled={!userConsent}
          >
            웹캠 시작
          </button>
        ) : (
          <button 
            className="webcam-button stop"
            onClick={stopWebcam}
          >
            웹캠 중지
          </button>
        )}
      </div>

      {/* 웹캠 섹션 */}
      {showWebcam && (
        <div className="webcam-container">
          <div className="webcam-wrapper">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={1000}
              height={700}
              className="webcam"
            />
            
            {/* 신분증 가이드 프레임 */}
            <div className="id-card-guide-frame"></div>
          </div>
          
          <div className="webcam-controls">
            <button onClick={capture} className="capture-button">수동 캡처</button>
            <p className="detection-info">
              가이드 영역 안에 신분증을 위치시키면 자동으로 인식됩니다.
            </p>
          </div>
        </div>
      )}

      {/* 캡처된 이미지 표시 */}
      {capturedImage && (
        <div className="captured-image-container">
          <h3>캡처된 신분증 이미지</h3>
          <img src={capturedImage} alt="캡처된 이미지" className="captured-image" />
          {processing && <div className="processing-indicator">처리 중...</div>}
        </div>
      )}

      {/* 메시지 표시 */}
      {message && (
        <div className={`message ${message.includes("성공") ? "success" : "error"}`}>
          {message}
        </div>
      )}
      
      {/* 재시도 버튼 */}
      {capturedImage && !processing && (
        <button onClick={startWebcam} className="retry-button">
          다시 시도
        </button>
      )}
    </div>
  );
}

export default Roi;
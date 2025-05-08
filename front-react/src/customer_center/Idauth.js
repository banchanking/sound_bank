import React, { useState } from "react";
import styles from "../Css/customer_center/Idauth.module.css"; // 기존 클래스명: roi 스타일 모듈화

function IdAuth({ onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [extractedData, setExtractedData] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };
  
 // app_ocr/client/src/IdAuth.js
  const handleUpload = async () => {
    if (!selectedFile) {
        setMessage("이미지를 업로드해주세요.");
        return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {                           
        const response = await fetch("https://appocr.jp.ngrok.io/ocr", {   
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        console.log("서버 응답:", result);
        

        if (response.ok && result && result.status === "success") {
            setMessage("인증 성공: " + (result.message || "인증 완료되었습니다."));
            setExtractedData(result.extracted_data); // 추출된 데이터 저장
            // Join 컴포넌트에 인증 성공 알림
          if (typeof onSuccess === 'function') {            
            onSuccess(result.extracted_data);
          }
        } else {
            setMessage("인증 실패: " + (result.message || "등록되지 않은 주민번호 입니다."));
            setExtractedData(result.extracted_data); // 실패 시에도 데이터 표시
        }
    } catch (error) {
        setMessage("통신 실패: " + error.message);
        setExtractedData(null);
    }
  };
  // 발급일 포맷팅 함수
  const formatDate = (dateStr) => {
    if (dateStr && dateStr.length === 8) {
      return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
    }
    return dateStr || '';
  };

  // 주민등록번호 마스킹 함수
  const maskRRN = (rrn) => {
    if (rrn && rrn.match(/^\d{6}-\d{7}$/)) {
      return rrn.replace(/(\d{6}-\d{1})\d{6}/, '$1******');
    }
    return rrn || '';
  };
  
  return (
    // 전체 wrap (사뱅 스타일)
    <div className={styles["wrap"]}>
      {/* 기존 클래스명: roi-container */}
      <div className={styles["roi-container"]}>
        {/* 기존 클래스명: roi-title */}
        <h1 className={styles["roi-title"]}>주민등록증 인증</h1>

        {/* 기존 클래스명: dropzone */}
        <div
          className={styles["dropzone"]}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("fileInput").click()}
        >
          {selectedFile ? (
            <p className={styles["file-name"]}>{selectedFile.name}</p>
          ) : (
            <p className={styles["dropzone-text"]}>여기로 이미지를 드래그하거나 클릭해서 선택하세요</p>
          )}
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className={styles["hidden"]}
          />
        </div>

        {/* 기존 클래스명: preview-container + btn-blue 묶음 */}
        <div className={styles["bottom-area"]}>
          {selectedFile && (
            <div className={styles["preview-container"]}>
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="thumbnail"
                className={styles["preview-img"]}
              />
            </div>
          )}

          <button type="button" className={styles["btn-blue"]} onClick={handleUpload}>
            확인
          </button>
        </div>

        {/* 기존 클래스명: message-box */}
        {message && <div className={styles["message-box"]}>{message}</div>}
        {extractedData && (
          <div className={styles["extracted-data"]}>
            <h2>추출된 정보</h2>
            <p><strong>이름:</strong> {extractedData.ocr_fields_name || '없음'}</p>
            <p><strong>주민등록번호:</strong> {maskRRN(extractedData.ocr_fields_rrn)}</p>
            <p><strong>주소:</strong> {extractedData.ocr_fields_address || '없음'}</p>
            <p><strong>발급일:</strong> {formatDate(extractedData.ocr_fields_issue_date)}</p>
            <p><strong>발급처:</strong> {extractedData.ocr_fields_issue_office || '없음'}</p>
            <p><strong>타입:</strong> {extractedData.ocr_fields_type || '없음'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IdAuth;

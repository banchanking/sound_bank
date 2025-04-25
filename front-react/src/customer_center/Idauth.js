import React, { useState } from "react";
import styles from "../Css/customer_center/Idauth.module.css"; // 기존 클래스명: roi 스타일 모듈화

function IdAuth() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

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
  try {                           // ngrok 8시간주기로 or 로컬서버(노트북을 off) 서버 꺼짐
      const response = await fetch("https://06e8-180-71-139-27.ngrok-free.app/ocr", {   
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
    // ✅ 전체 wrap (사뱅 스타일)
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

          <button className={styles["btn-blue"]} onClick={handleUpload}>
            확인
          </button>
        </div>

        {/* 기존 클래스명: message-box */}
        {message && <div className={styles["message-box"]}>{message}</div>}
      </div>
    </div>
  );
}

export default IdAuth;

import React, { useState } from "react";


function IdAuth() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

 // app_ocr/client/src/IdAuth.js
const handleUpload = async () => {
  if (!selectedFile) {
      setMessage("이미지를 업로드해주세요.");
      return;
  }
  const formData = new FormData();
  formData.append("file", selectedFile);
  try {                                   // ngrok 8시간주기로 무료 종료됨 
      const response = await fetch("https://6219-180-71-139-27.ngrok-free.app/ocr", {  
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
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">주민등록증 인증</h1>

      <div
        className="border-4 border-dashed border-gray-400 rounded-xl h-64 flex items-center justify-center mb-4 bg-gray-50 hover:bg-gray-100"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("fileInput").click()}
      >
        {selectedFile ? (
          <p className="text-gray-600">{selectedFile.name}</p>
        ) : (
          <p className="text-gray-400">여기로 이미지를 드래그하거나 클릭해서 선택하세요</p>
        )}
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      <button
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        onClick={handleUpload}
      >
        확인
      </button>

      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm border">
          {message}
        </div>
      )}
    </div>
  );
}

export default IdAuth;
import React from 'react';


const FileDownLoader = () => {
    
    const handleDownload = async () => {
        try{
            const response = await fetch('http://15.165.57.30:8081/download'); // 서버에서 파일 다운로드
            const blob = await response.blob(); // Blob 데이터로 변환
            const link = document.createElement('a'); // a 태그 생성
            link.href = URL.createObjectURL(blob); // Blob 데이터를 URL로 생성
            link.download = 'file.pdf'; // 다운로드 파일명
            link.click(); // 다운로드 실행
        } catch(error) {
            console.error(error);
        }
           

    };
    return (
        <div>
            <button onClick={handleDownload}>파일 다운로드</button>
        </div>
    );
};

export default FileDownLoader;
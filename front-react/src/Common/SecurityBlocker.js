import { useEffect } from "react";

const SecurityBlocker = () => {
  useEffect(() => {
    // 개발자 도구(F12) 및 소스 코드 보기 차단
    const handleKeyDown = (event) => {
      if (
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && event.key === "I") ||
        (event.ctrlKey && event.shiftKey && event.key === "J") ||
        (event.ctrlKey && event.key === "U")
      ) {
        event.preventDefault();
        alert("개발자 도구 사용이 제한되었습니다.");
      }
    };

    // 마우스 우클릭 방지
    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    // 드래그 방지
    const handleSelectStart = (event) => {
      event.preventDefault();
    };

    // 스크린샷 감지 (화면 크기 변화 체크)
    const detectScreenCapture = () => {
      if (
        window.outerHeight - window.innerHeight > 200 ||
        window.outerWidth - window.innerWidth > 200
      ) {
        document.body.style.display = "none";
        alert("캡처가 감지되었습니다.");
        setTimeout(() => {
          document.body.style.display = "block";
        }, 1000);
      }
    };

    // 이벤트 리스너 추가
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    setInterval(detectScreenCapture, 1000);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
    };
  }, []);

  return null; // UI 요소 없이 기능만 제공
};

export default SecurityBlocker;

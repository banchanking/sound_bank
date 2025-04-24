import { useEffect } from "react";

const SecurityBlocker = () => {
  useEffect(() => {
    // 확대/축소 방지
    const preventZoom = (event) => {
      if (
        (event.ctrlKey && (event.key === "+" || event.key === "-" || event.key === "=")) ||
        event.ctrlKey || event.metaKey // Mac command 키
      ) {
        event.preventDefault();
      }
    };

    const preventWheelZoom = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    // 개발자 도구 및 기타 방지
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

    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    const handleSelectStart = (event) => {
      event.preventDefault();
    };

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

    // 이벤트 리스너 등록
    document.addEventListener("keydown", preventZoom, { passive: false });
    document.addEventListener("wheel", preventWheelZoom, { passive: false });
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    const intervalId = setInterval(detectScreenCapture, 1000);

    return () => {
      // 이벤트 리스너 제거
      document.removeEventListener("keydown", preventZoom);
      document.removeEventListener("wheel", preventWheelZoom);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      clearInterval(intervalId);
    };
  }, []);

  return null;
};

export default SecurityBlocker;

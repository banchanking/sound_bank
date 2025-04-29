import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../Css/Common/TrueFocus.css";

const TrueFocus = ({
  items,
  manualMode = false,
  blurAmount = 5,
  borderColor = "white",
  animationDuration = 0.3,
  pauseBetweenAnimations = 1,
  onItemClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(0); // 이미지 로딩 개수 추적

  const containerRef = useRef(null);
  const refs = useRef([]);
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [measured, setMeasured] = useState(false);

  // 자동 순환 모드일 때 인덱스 변경
  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(() => {
        setCurrentIndex(i => (i + 1) % items.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);
      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, items.length]);

  // 이미지 로드될 때마다 카운트 증가
  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  // 현재 포커스 요소 위치 계산 (이미지 로드 이후에만 측정)
  useLayoutEffect(() => {
    const el = refs.current[currentIndex];
    const parent = containerRef.current;
    if (!el || !parent) return;

    // 이미지 있는 경우엔 모두 로딩될 때까지 대기
    const hasImages = items.some(item => item.src);
    if (hasImages && imagesLoaded < items.length) return;

    const p = parent.getBoundingClientRect();
    const e = el.getBoundingClientRect();
    setRect({
      x: e.left - p.left,
      y: e.top - p.top,
      width: e.width,
      height: e.height,
    });
    setMeasured(true);
  }, [currentIndex, imagesLoaded, items]);

  // 마우스 오버 시 포커스 이동 (수동 모드)
  const handleEnter = idx => {
    if (manualMode) {
      setLastIndex(currentIndex);
      setCurrentIndex(idx);
    }
  };
  const handleLeave = () => {
    if (manualMode && lastIndex !== null) {
      setCurrentIndex(lastIndex);
    }
  };

  return (
    <div className="focus-container" ref={containerRef}>
      {items.map((item, idx) => {
        const active = idx === currentIndex;
        return (
          <span
            key={idx}
            ref={el => (refs.current[idx] = el)}
            className={`focus-word ${active ? "active" : ""}`}
            style={{
              filter: active ? "blur(0px)" : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease`,
            }}
            onMouseEnter={() => handleEnter(idx)}
            onMouseLeave={handleLeave}
            onClick={() => onItemClick && onItemClick(item)}
          >
            {item.src ? (
              <img
                src={item.src}
                alt={item.alt}
                style={{ width: "40px", height: "auto", display: "block" }}
                onLoad={handleImageLoad}
              />
            ) : (
              item.alt
            )}
          </span>
        );
      })}

      {measured && (
        <motion.div
          className="focus-frame"
          style={{ "--border-color": borderColor }}
          initial={false}
          animate={{
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            opacity: 1,
          }}
          transition={{ duration: animationDuration }}
        >
          <span className="corner top-left" />
          <span className="corner top-right" />
          <span className="corner bottom-left" />
          <span className="corner bottom-right" />
        </motion.div>
      )}
    </div>
  );
};

export default TrueFocus;

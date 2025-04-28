// src/components/TrueFocus.js
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
  const containerRef = useRef(null);
  const refs = useRef([]);
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [measured, setMeasured] = useState(false);

  // 자동 순환
  useEffect(() => {
    if (!manualMode) {
      const iv = setInterval(() => {
        setCurrentIndex(i => (i + 1) % items.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);
      return () => clearInterval(iv);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, items.length]);

  // 포커스 프레임 위치/크기 동기 측정
  useLayoutEffect(() => {
    const el = refs.current[currentIndex];
    const parent = containerRef.current;
    if (!el || !parent) return;

    setTimeout(() => {
      const p = parent.getBoundingClientRect();
      const e = el.getBoundingClientRect();
      setRect({
        x: e.left - p.left,
        y: e.top - p.top,
        width: e.width,
        height: e.height,
      });
      setMeasured(true);
    }, 0);
  }, [currentIndex]);

  // 마우스 오버 (수동 모드)
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
                style={{ width: "55px", height: "auto", display: "block" }}
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

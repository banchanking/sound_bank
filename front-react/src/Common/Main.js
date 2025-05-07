import React, { useState, useEffect } from "react";
import BlurText from "./BlurText";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "../Css/Common/Main.css";
import TrueFocus from "./TrueFocus";
import Orb from "./Orb";
import { useNavigate } from "react-router-dom";
import VoiceBot from "../customer_center/components/Voicebot";

const Main = () => {
  const data = [
    {
      image: "./Images/main/main1.png",
      title: "음성 AI로 혁신하는 뱅킹",
      desc: "효율성과 편의를 극대화한 차세대 금융 경험. 음성 AI로 모든 서비스를 정밀하게 관리하세요.",
    },
    {
      image: "./Images/main/main2.png",
      title: "사운드뱅크, 새로운 대출 상품 출시",
      desc: "간편한 대출 심사와 낮은 이자로 새로운 금융 서비스를 만나보세요.",
    },
    {
      image: "./Images/main/main3.png",
      title: "예적금 금리 인상! 지금 가입하세요",
      desc: "높은 금리의 예적금을 지금 바로 확인하고 가입해 보세요.",
    },
  ];

  const [index, setIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const iv = setInterval(() => setIndex((i) => (i + 1) % data.length), 4500);
    return () => clearInterval(iv);
  }, [data.length]);

  const next = () => setIndex((i) => (i + 1) % data.length);
  const prev = () => setIndex((i) => (i - 1 + data.length) % data.length);

  const handleFocusClick = (item) => {
    setSelectedItem(item.alt);
    if (item.alt === "soundAI") {
      setIsModalOpen(true);
    } else if (item.alt === "chatBot") {
      navigate("/chatBot");
    }
  };

  return (
    <div className="home">
      <header
        className="banner"
        style={{
          backgroundImage: `url(${data[index].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "110vh",
        }}
      >
        <div className="overlay" />
        <div className="content">
          <BlurText
            text={data[index].title}
            delay={150}
            animateBy="words"
            direction="top"
            className="title"
          />
          <BlurText
            text={data[index].desc}
            delay={150}
            animateBy="words"
            direction="bottom"
            className="desc"
          />
          <div className="buttons">
            <button onClick={prev} className="nav">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button onClick={next} className="nav">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
        <div className="focus-wrapper">
          <TrueFocus
            items={[
              // { src: "/Images/main/soundAI.png", alt: "soundAI" },
              { src: "/Images/main/chatAI.png", alt: "chatBot" },
            ]}
            manualMode={true}
            blurAmount={3}
            borderColor="#fff"
            animationDuration={0.3}
            pauseBetweenAnimations={1}
            onItemClick={handleFocusClick}
          />
        </div>
        {isModalOpen && (
          <div className="orb-modal">
            <div className="orb-background" onClick={() => setIsModalOpen(false)} />
            <div className="orb-content">
              <Orb
                hoverIntensity={0.5}
                rotateOnHover={true}
                hue={0}
                forceHoverState={false}
              />
              <VoiceBot isModalOpen={isModalOpen} selectedItem={selectedItem} />
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Main;
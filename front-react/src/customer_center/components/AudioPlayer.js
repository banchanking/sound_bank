import React, { useEffect, useRef } from 'react';

const AudioPlayer = ({ audioSrc, autoPlay }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audioSrc && audio) {
      console.log(`AudioPlayer 렌더링, src: ${audioSrc}, autoPlay: ${autoPlay}`);
      audio.src = audioSrc;
      audio.addEventListener('error', (e) => {
        console.error('오디오 로드 실패:', e.target.error);
      });
      audio.addEventListener('loadeddata', () => {
        console.log('오디오 데이터 로드 성공');
      });
      if (autoPlay) {
        audio.play().then(() => {
          console.log('오디오 재생 시작');
        }).catch((error) => {
          console.error('오디오 재생 오류:', error.message);
        });
      }
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        console.log('오디오 정리');
      }
    };
  }, [audioSrc, autoPlay]);

  return <audio ref={audioRef} />;
};

export default AudioPlayer;
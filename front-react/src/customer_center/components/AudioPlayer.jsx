import React from 'react';

const AudioPlayer = ({ src }) => {
  return (
    <audio src={src} controls autoPlay />
  );
};

export default AudioPlayer;

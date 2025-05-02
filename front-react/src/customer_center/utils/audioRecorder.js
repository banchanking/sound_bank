let mediaRecorder;
let audioStream;

export async function startRecording(onDataAvailable) {
  audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(audioStream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      onDataAvailable(event.data);
    }
  };

  mediaRecorder.start(1000); // 100ms 단위로 오디오 청크 전송
}

export function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
  }
}

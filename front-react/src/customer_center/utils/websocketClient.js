let ws = null;

export function connectWebSocket(onMessage) {
  ws = new WebSocket('ws://localhost:8002/ws/voice');

  ws.onopen = () => {
    console.log('[WebSocket] 연결 성공');
  };

  ws.onmessage = (event) => {
    onMessage(event.data);
  };

  ws.onclose = () => {
    console.log('[WebSocket] 연결 종료');
  };

  ws.onerror = (error) => {
    console.error('[WebSocket] 에러 발생:', error);
  };

  return ws;
}

export function disconnectWebSocket(socket) {
  if (socket) {
    socket.close();
  }
}

export function sendAudioChunk(chunk) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(chunk);
  }
}

let currentWS = null;
let reconnect = 0;

export const connectWebSocket = (onMessage) => {
  // 이미 연결된 WebSocket이 있다면 재사용
  if (currentWS && currentWS.readyState === WebSocket.OPEN) {
    console.log('[WebSocket] 이미 연결되어 있음.');
    return currentWS;
  }

  // 연결 중일 경우 재연결 방지
  if (currentWS && currentWS.readyState === WebSocket.CONNECTING) {
    console.log('[WebSocket] 연결 중입니다. 대기 중...');
    return currentWS;
  }

  const ws = new WebSocket('ws:///sound-bank.duckdns.org:8002/ws/voice');
  currentWS = ws;

  ws.onopen = () => {
    console.log('[WebSocket] 연결 성공');
    reconnect = 0;
  };

  ws.onmessage = (event) => {
    if (event.data instanceof Blob) {
      onMessage(event.data);
    } else {
      onMessage(event.data);
    }
  };

  ws.onclose = () => {
    console.log('[WebSocket] 연결 종료. 재연결 시도...');
    reconnect += 1;
    const reconnectDelay = Math.min(3000 * reconnect, 30000); // 최대 30초
    console.log(`[WebSocket] ${reconnectDelay / 1000} 초 후 재연결 시도`);

    setTimeout(() => connectWebSocket(onMessage), reconnectDelay);
  };

  ws.onerror = (error) => {
    console.error('[WebSocket] 오류:', error);
  };

  return ws;
};

export const disconnectWebSocket = () => {
  if (!currentWS) return;

  if (currentWS.readyState === WebSocket.OPEN) {
    console.log('[WebSocket] 연결 닫기');
    currentWS.close();
  } else if (currentWS.readyState === WebSocket.CONNECTING) {
    console.log('[WebSocket] 연결 중 → 연결되면 자동 종료 예정');
    currentWS.onopen = () => {
      currentWS.close();
    };
  } else {
    console.log('[WebSocket] 연결이 이미 닫혔거나 종료 상태입니다.');
  }

  currentWS = null;
};

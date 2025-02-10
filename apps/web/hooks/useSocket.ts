import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
  const [loading, setLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      console.log("Connected to WebSocket");

      setSocket(ws);
      setLoading(false);
    };
    return () => {
      ws.close();
      setSocket(undefined);
      console.log("Disconnected from WebSocket");
    };
  }, []);

  return { socket, loading };
}

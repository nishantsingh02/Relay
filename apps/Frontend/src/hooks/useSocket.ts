import { useEffect, useState, useRef, useCallback } from "react";
import "../App.css"

// export default function useSocket() {
//     const [ws, setWs] = useState(new WebSocket("ws://localhost:8080"))
//     const [loading, setLoading] = useState(true)

//     useEffect(() => {
//         ws.onopen = () => {
//             if(ws){
//                 setWs(ws)
//                 setLoading(false)
//             }
//         }
//     }, [ws])

//     return {
//         socket: ws,
//         loading
//     }
// }

// const [ws, setWs] = useState(new WebSocket("ws://localhost:8080"))
// useState(initializer) — the new WebSocket() runs every time the component mounts. If the component remounts (Vite HMR saves a file, parent re-renders, etc.), a brand new WebSocket connection is created.
// useRef doesn't have this problem — it persists across re-renders and remounts.

type MessageHandler = (msg: any) => void;

export default function useSocket() {
    const [loading, setLoading] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);
    const listenersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080");
        wsRef.current = ws;

        ws.onopen = () => setLoading(false);
        ws.onmessage = (event) => {
            const parsed = JSON.parse(event.data);
            const handlers = listenersRef.current.get(parsed.type);
            if (handlers) {
                handlers.forEach((handler) => handler(parsed));
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const send = useCallback((msg: any) => {
        wsRef.current?.send(JSON.stringify(msg));
    }, []);

    const on = useCallback((type: string, handler: MessageHandler) => {
        if (!listenersRef.current.has(type)) {
            listenersRef.current.set(type, new Set());
        }
        listenersRef.current.get(type)!.add(handler);
        return () => {
            listenersRef.current.get(type)?.delete(handler);
        };
    }, []);

    return { socket: wsRef.current, loading, send, on };
}


// this hook manages the WebSocket connection to your backend.

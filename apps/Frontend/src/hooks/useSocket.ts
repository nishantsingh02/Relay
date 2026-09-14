import { useEffect, useState, useRef } from "react";
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

export default function useSocket() {
    const [loading, setLoading] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);

    if (!wsRef.current) {
        wsRef.current = new WebSocket("ws://localhost:8080");
    }

    useEffect(() => {
        const ws = wsRef.current!;
        ws.onopen = () => setLoading(false);
    }, []);

    return { socket: wsRef.current, loading };
}


// this hook manages the WebSocket connection to your backend.
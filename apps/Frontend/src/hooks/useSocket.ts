import { useEffect, useState } from "react";
import "../App.css"

export default function useSocket() {
    const [ws, setWs] = useState(new WebSocket("ws://localhost:8080"))
    const [loading, setLoading] = useState(true)

    console.log("hi")
    useEffect(() => {
        ws.onopen = () => {
            if(ws){
                setWs(ws)
                setLoading(false)
            }
        }
    }, [ws])

    return {
        socket: ws,
        loading
    }
}
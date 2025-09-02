import React, { useEffect, useState, useRef } from "react";

export default function LiveWeightDisplay({ simulation: initialSimulation, onWeightChange }) {
  const [weight, setWeight] = useState("0.00");
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [simulation, setSimulation] = useState(initialSimulation);
  const retries = useRef(0);
  const wsRef = useRef(null);
  const maxRetries = 3;

  useEffect(() => {
    let interval;

    const connectWebSocket = () => {
      if (simulation) return;

      console.log("Attempting WebSocket connection...");
      wsRef.current = new WebSocket("ws://localhost:9091"); // ✅ Updated to 9091

      wsRef.current.onopen = () => {
        retries.current = 0;
        setConnectionStatus("Live Weight");
        console.log("✅ WebSocket connected");
      };

      wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // ✅ Parse JSON
        if (data.weight) {
          setWeight(data.weight);
          if (onWeightChange) onWeightChange(data.weight);
        }
      } catch (err) {
        console.error("Invalid JSON from WebSocket:", err);
      }
    };

      wsRef.current.onerror = () => {
        console.error("❌ WebSocket error");
      };

      wsRef.current.onclose = () => {
        retries.current += 1;
        if (retries.current <= maxRetries) {
          console.warn(`WebSocket closed. Retrying... (${retries.current}/${maxRetries})`);
          setConnectionStatus(`Retrying WebSocket (${retries.current}/${maxRetries})...`);
          setTimeout(connectWebSocket, 2000);
        } else {
          console.warn("Max retries reached. Switching to simulation mode...");
          setConnectionStatus("Simulation Mode");
          setSimulation(true);
        }
      };
    };

    if (!simulation) {
      connectWebSocket();
    }

    if (simulation) {
      interval = setInterval(() => {
        const newWeight = (Math.random() * 1000).toFixed(2);
        setWeight(newWeight);
        if (onWeightChange) onWeightChange(newWeight);
      }, 3000);
    }

    return () => {
      console.log("Cleaning up...");
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (interval) clearInterval(interval);
    };
  }, [simulation, onWeightChange]);

  return (
    <div style={{ textAlign: "center" }}>
      <h5>{connectionStatus}</h5>
      <h2>{weight} kg</h2>
    </div>
  );
}

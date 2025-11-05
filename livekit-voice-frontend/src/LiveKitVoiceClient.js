// LiveKitVoiceClient.js
import React, { useEffect, useState, useRef } from "react";
import { Room, createLocalAudioTrack } from "livekit-client";

const LIVEKIT_URL = "wss://test-6m6dyl3x.livekit.cloud";
const LIVEKIT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlci0xIiwidmlkZW8iOnsicm9vbUpvaW4iOnRydWUsInJvb20iOiJ0ZXN0LXJvb20iLCJjYW5QdWJsaXNoIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlfSwic3ViIjoidXNlci0xIiwiaXNzIjoiQVBJRGN5RXBLQ1BwQkZSIiwibmJmIjoxNzYyMzQ1ODAyLCJleHAiOjE3NjIzNjc0MDJ9.x0oHCl3IjAraqbz0fjtdFQgyDWfqH2WzauVzuJQf8rE";

const initialMessages = [{ sender: "agent", text: "Hello! How can I help you today?" }];

export default function LiveKitVoiceClient() {
  const [room, setRoom] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [agentSpeaking, setAgentSpeaking] = useState(false);

  const messagesEndRef = useRef(null);
  const audioTrackRef = useRef(null); // To ensure only one mic track

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to initialize room and audio
  async function joinRoom() {
    setConnecting(true);

    try {
      const roomInstance = new Room({
        rtcConfig: {
          iceServers: [
            { urls: ["stun:stun.l.google.com:19302"] },
            { urls: ["turn:turn.livekit.cloud:443?transport=tcp"], username: "livekit", credential: "livekit" },
          ],
        },
      });

      roomInstance.on("disconnected", () => setConnected(false));
      roomInstance.on("stateChanged", (state) => {
        if (state === "connected") setConnected(true);
      });

      await roomInstance.connect(LIVEKIT_URL, LIVEKIT_TOKEN, {
        audio: false, // We manually publish audio after gesture
        video: false,
      });

      setRoom(roomInstance);
      setConnected(true);

      // Only create/publish audio if not already done
      if (!audioTrackRef.current) {
        const audioTrack = await createLocalAudioTrack();
        audioTrackRef.current = audioTrack;
        await roomInstance.localParticipant.publishTrack(audioTrack);
        console.log("Local audio started!");
      }

      // Listen for agent audio
      roomInstance.on("trackSubscribed", (track) => {
        if (track.kind === "audio") {
          setAgentSpeaking(true);
          setTimeout(() => setAgentSpeaking(false), 600);
        }
      });

      // Listen for data messages
      roomInstance.on("dataReceived", (payload, participant) => {
        if (participant?.identity && participant.identity !== "user-1") {
          const text = new TextDecoder().decode(payload);
          setMessages((m) => [...m, { sender: "agent", text }]);
        }
      });

      // Handle reconnects
      roomInstance.on("reconnecting", () => console.log("Reconnecting..."));
      roomInstance.on("reconnected", () => console.log("Reconnected!"));
    } catch (err) {
      alert("Failed to connect LiveKit room: " + err.message);
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  }

  // Send user text
  async function handleSend() {
    if (input.trim() && connected && room) {
      setMessages((msgs) => [...msgs, { sender: "user", text: input.trim() }]);
      await room.localParticipant.publishData(input.trim(), "Reliable");
      setInput("");
    }
  }

  return (
    <div style={centerWrap}>
      <div style={cardStyle}>
        <div style={headerStyle}>LiveKit Voice Agent</div>

        <div style={messagesContainerStyle}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  maxWidth: 260,
                  padding: "11px 18px",
                  borderRadius: 18,
                  background: msg.sender === "user" ? "#007aff" : "#fff",
                  color: msg.sender === "user" ? "#fff" : "#222",
                  fontSize: 16,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                {msg.text}
                {msg.sender === "agent" && agentSpeaking && (
                  <span style={waveInside} aria-label="agent-wave" />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* User gesture button to start audio */}
        {!connected && (
          <div style={{ padding: 12, textAlign: "center" }}>
            <button onClick={joinRoom} style={joinButtonStyle} disabled={connecting}>
              {connecting ? "Connecting..." : "Join Room / Start Audio"}
            </button>
          </div>
        )}

        <div style={inputRowStyle}>
          <input
            type="text"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={inputStyle}
            disabled={!connected}
          />
          <button onClick={handleSend} disabled={!input.trim() || !connected} style={sendButtonStyle}>
            Send
          </button>
        </div>

        <div style={footerStatusStyle}>
          {connecting && "Connecting..."}
          {connected && "Connected!"}
          {!connecting && !connected && "Disconnected"}
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const centerWrap = { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20, background: "#f5f7fa" };
const cardStyle = { width: 430, height: 520, borderRadius: 16, border: "1px solid #e5e5e5", display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff", boxShadow: "0 10px 26px rgba(0,0,0,0.08)" };
const headerStyle = { textAlign: "center", padding: "14px 0", fontWeight: 600, borderBottom: "1px solid #eee", background: "#fff" };
const messagesContainerStyle = { flex: 1, padding: "14px 18px", overflowY: "auto", background: "#f7f8fb" };
const waveInside = { display: "inline-block", width: 26, height: 12, marginLeft: 8, verticalAlign: "middle", background: "linear-gradient(90deg, #4c9aff 0, #4c9aff 40%, transparent 40%), linear-gradient(90deg, #4c9aff 0, #4c9aff 25%, transparent 25%)", borderRadius: 6, animation: "pulse 0.8s infinite" };
const inputRowStyle = { display: "flex", padding: 12, borderTop: "1px solid #eee", background: "#fff", alignItems: "center" };
const inputStyle = { flex: 1, padding: "12px 14px", fontSize: 14, borderRadius: 10, border: "1px solid #ddd", background: "#f5f5f5" };
const sendButtonStyle = { marginLeft: 10, padding: "10px 14px", borderRadius: 8, border: "none", background: "#1f9dff", color: "#fff", cursor: "pointer" };
const footerStatusStyle = { textAlign: "center", padding: 12, color: "#5c5c5c", fontSize: 12 };
const joinButtonStyle = { padding: "12px 20px", borderRadius: 8, border: "none", background: "#1a73e8", color: "#fff", fontSize: 16, cursor: "pointer" };
const waveInsideKeyframes = `@keyframes pulse { 0% { transform: scaleX(0.5); opacity: 0.6; } 50% { transform: scaleX(1); opacity: 1; } 100% { transform: scaleX(0.5); opacity: 0.6; } }`;

// Inject keyframes for waveform
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(waveInsideKeyframes, styleSheet.cssRules.length);

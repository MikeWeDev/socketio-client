import { useEffect, useState } from "react";
import socket from "./socket";

type ChatMessage = {
  username: string;
  text: string;
};

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      username,
      text: message,
    };

    setMessages((prev) => [...prev, newMessage]);

    socket.emit("message", newMessage);

    setMessage("");
  };

  if (!joined) {
    return (
      <div style={{ padding: "40px", maxWidth: "400px" }}>
        <h2>Join Chat</h2>

        <input
          type="text"
          placeholder="Enter your username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />
        <br />

        <button
          disabled={!username.trim()}
          onClick={() => setJoined(true)}
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "500px" }}>
      <h1>Socket.IO Chat</h1>

      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>

      <p>
        Logged in as: <strong>{username}</strong>
      </p>

      <input
        type="text"
        placeholder="Enter a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />

      <button onClick={sendMessage}>
        Send Message
      </button>

      <h3>Messages ({messages.length})</h3>

      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.username}:</strong> {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
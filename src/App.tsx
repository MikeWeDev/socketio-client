import { useEffect, useState } from "react";
import socket from "./socket";

type ChatMessage = {
  username: string;
  text: string;
  time: string;
  system?: boolean;
};

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

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

    socket.on("online-users", (count: number) => {
      setOnlineUsers(count);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("online-users");
    };
  }, []);

  useEffect(() => {
    if (joined) {
      socket.emit("join", username);
    }
  }, [joined, username]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      username,
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
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
        <strong>Users Online:</strong> {onlineUsers}
      </p>

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

      <button onClick={sendMessage}>Send Message</button>

      <h3>Messages ({messages.length})</h3>

      <ul style={{ padding: 0 }}>
        {messages.map((msg, index) => (
          <li
            key={index}
            style={{
              listStyle: "none",
              marginBottom: "12px",
              borderBottom: "1px solid #ddd",
              paddingBottom: "8px",
              color: msg.system ? "#666" : "inherit",
              fontStyle: msg.system ? "italic" : "normal",
            }}
          >
            {msg.system ? (
              <>
                <span>{msg.text}</span>

                <span
                  style={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    color: "gray",
                  }}
                >
                  {msg.time}
                </span>
              </>
            ) : (
              <>
                <strong>{msg.username}</strong>

                <span
                  style={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    color: "gray",
                  }}
                >
                  {msg.time}
                </span>

                <div>{msg.text}</div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
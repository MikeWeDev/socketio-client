import { useEffect, useRef, useState } from "react";
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
  const [connected, setConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const joinInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!joined) {
      joinInputRef.current?.focus();
    }
  }, [joined]);
  useEffect(() => {
  return () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
}, []);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
      if (joined && username.trim()) {
        socket.emit("join", username.trim());
      }
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onMessage(incomingMessage: ChatMessage) {
      setMessages((prev) => [...prev, incomingMessage]);
    }

    function onOnlineUsers(count: number) {
      setOnlineUsers(count);
    }

   function onUserTyping(data: { username: string; isTyping: boolean }) {
  if (data.username === username.trim()) {
    return;
  }

  if (data.isTyping) {
    setTypingUser(data.username);
  } else {
    setTypingUser(null);
  }
}

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("online-users", onOnlineUsers);
    socket.on("user-typing", onUserTyping);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.off("online-users", onOnlineUsers);
      socket.off("user-typing", onUserTyping);
    };
  }, [joined, username]);

  useEffect(() => {
    if (joined && username.trim()) {
      socket.emit("join", username.trim());
    }
  }, [joined]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typingUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    socket.emit("typing", true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", false);
    }, 2000);
  };

  const handleJoin = () => {
    if (username.trim()) {
      setJoined(true);
    }
  };
  
const handleLeave = () => {
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;
  }

  socket.emit("typing", false);
  socket.disconnect();

  setJoined(false);
  setMessages([]);
  setMessage("");
  setTypingUser(null);

  socket.connect();
};

  const sendMessage = () => {
    if (!message.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("typing", false);

   const newMessage: ChatMessage = {
  username: username.trim(),
  text: message.trim(),
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

    socket.emit("message", newMessage);

    setMessage("");
    inputRef.current?.focus();
  };

  if (!joined) {
    return (
      <div style={styles.joinPage}>
        <div style={styles.joinCard}>
          <h1 style={styles.logo}>💬 ChatFlow</h1>

          <p style={styles.subtitle}>Join the real-time conversation</p>

          <input
            ref={joinInputRef}
            style={styles.input}
            placeholder="Your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleJoin();
              }
            }}
          />

          <button
            style={{
              ...styles.button,
              opacity: username.trim() ? 1 : 0.5,
              cursor: username.trim() ? "pointer" : "not-allowed",
            }}
            disabled={!username.trim()}
            onClick={handleJoin}
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.chatContainer}>
        <header style={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>💬 ChatFlow</h2>
            <small>Logged in as {username}</small>
          </div>

          <div style={styles.status}>
            <span>{connected ? "🟢 Online" : "🔴 Offline"}</span>
            <span>👥 {onlineUsers}</span>
            <button onClick={handleLeave} style={styles.leaveButton}>
              Leave
            </button>
          </div>
        </header>

        <div style={styles.messages}>
          {messages.map((msg, index) => (
            <div key={index}>
              {msg.system ? (
                <div style={styles.systemMessage}>
                  {msg.text} <small>{msg.time}</small>
                </div>
              ) : (
                <div
                  style={{
                    ...styles.messageBubble,
                    marginLeft: msg.username === username ? "auto" : "0",
                    background: msg.username === username ? "#2563eb" : "#1f2937",
                  }}
                >
                  <div style={styles.messageHeader}>
                    <strong>{msg.username}</strong>
                    <small>{msg.time}</small>
                  </div>

                  <div>{msg.text}</div>
                </div>
              )}
            </div>
          ))}

          {typingUser && (
            <div style={styles.typingIndicator}>
              ✍️ <em>{typingUser} is typing...</em>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputArea}>
          <input
            ref={inputRef}
            style={styles.messageInput}
            placeholder="Type a message..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button
            style={{
              ...styles.sendButton,
              opacity: message.trim() ? 1 : 0.5,
              cursor: message.trim() ? "pointer" : "not-allowed",
            }}
            disabled={!message.trim()}
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#111827",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
  joinPage: {
    minHeight: "100vh",
    background: "#111827",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
  joinCard: {
    background: "#1f2937",
    padding: "40px",
    borderRadius: "25px",
    width: "350px",
    textAlign: "center",
    color: "white",
  },
  logo: {
    fontSize: "32px",
    margin: "0 0 10px 0",
  },
  subtitle: {
    color: "#9ca3af",
    marginBottom: "20px",
  },
  chatContainer: {
    width: "90%",
    maxWidth: "650px",
    height: "85vh",
    background: "#111827",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,.4)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px",
    background: "#1f2937",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
  },
  messageBubble: {
    color: "white",
    padding: "12px 16px",
    borderRadius: "15px",
    maxWidth: "70%",
    marginBottom: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,.25)",
  },
  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    fontSize: "12px",
    marginBottom: "5px",
  },
  systemMessage: {
    textAlign: "center",
    color: "#9ca3af",
    margin: "15px",
    fontStyle: "italic",
  },
  typingIndicator: {
    color: "#9ca3af",
    fontSize: "13px",
    marginBottom: "10px",
  },
  inputArea: {
    display: "flex",
    padding: "15px",
    gap: "10px",
    background: "#1f2937",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    marginBottom: "20px",
    background: "#374151",
    color: "white",
    outline: "none",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  messageInput: {
    flex: 1,
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#374151",
    color: "white",
    outline: "none",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "bold",
  },
  sendButton: {
    padding: "14px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
  },
  leaveButton: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },
} satisfies Record<string, React.CSSProperties>;

export default App;
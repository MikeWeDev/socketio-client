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
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);


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
  }, [joined]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);


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
      <div style={styles.joinPage}>

        <div style={styles.joinCard}>

          <h1 style={styles.logo}>
            💬 ChatFlow
          </h1>


          <p style={styles.subtitle}>
            Join the real-time conversation
          </p>


          <input
            style={styles.input}
            placeholder="Your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && username.trim()) {
                setJoined(true);
              }
            }}
          />


          <button
            style={{
              ...styles.button,
              opacity: username.trim() ? 1 : 0.5,
            }}
            disabled={!username.trim()}
            onClick={() => setJoined(true)}
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
            <h2 style={{ margin: 0 }}>
              💬 ChatFlow
            </h2>

            <small>
              Logged in as {username}
            </small>
          </div>


          <div style={styles.status}>

            <span>
              {connected ? "🟢 Online" : "🔴 Offline"}
            </span>


            <span>
              👥 {onlineUsers}
            </span>

          </div>

        </header>


        <div style={styles.messages}>

          {messages.map((msg, index) => (

            <div key={index}>

              {msg.system ? (

                <div style={styles.systemMessage}>
                  {msg.text}

                  <small>
                    {msg.time}
                  </small>
                </div>

              ) : (

                <div
                  style={{
                    ...styles.messageBubble,
                    marginLeft:
                      msg.username === username
                        ? "auto"
                        : "0",

                    background:
                      msg.username === username
                        ? "#2563eb"
                        : "#1f2937",
                  }}
                >

                  <div style={styles.messageHeader}>

                    <strong>
                      {msg.username}
                    </strong>


                    <small>
                      {msg.time}
                    </small>

                  </div>


                  <div>
                    {msg.text}
                  </div>

                </div>

              )}

            </div>

          ))}


          <div ref={messagesEndRef} />

        </div>


        <div style={styles.inputArea}>

          <input
            style={styles.messageInput}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />


          <button
            style={styles.sendButton}
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
    fontFamily: "Arial",
  },


  joinPage: {
    minHeight: "100vh",
    background: "#111827",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },


  joinCard: {
    background: "#1f2937",
    padding: "40px",
    borderRadius: "20px",
    width: "350px",
    textAlign: "center" as const,
    color: "white",
  },


  logo: {
    fontSize: "32px",
  },


  subtitle: {
    color: "#9ca3af",
  },


  chatContainer: {
    width: "600px",
    height: "700px",
    background: "#111827",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,.4)",
  },


  header: {
    padding: "20px",
    background: "#1f2937",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
  },


  status: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },


  messages: {
    height: "550px",
    overflowY: "auto" as const,
    padding: "20px",
  },


  messageBubble: {
    color: "white",
    padding: "12px 16px",
    borderRadius: "15px",
    maxWidth: "70%",
    marginBottom: "15px",
  },


  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    fontSize: "12px",
    marginBottom: "5px",
  },


  systemMessage: {
    textAlign: "center" as const,
    color: "#9ca3af",
    margin: "15px",
    fontStyle: "italic",
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
    cursor: "pointer",
  },


  sendButton: {
    padding: "14px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },

};


export default App;
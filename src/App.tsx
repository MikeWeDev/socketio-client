import { useEffect, useState } from "react";
import socket from "./socket";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected!");
      console.log("Socket ID:", socket.id);
    });

    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("message", message);

    setMessage("");
  };

  return (
    <div>
      <h1>Chat App</h1>

      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
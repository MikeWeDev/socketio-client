import { useEffect, useState } from "react";
import socket from "./socket";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);


  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected!");
      console.log("Socket ID:", socket.id);

      setConnected(true);
    });


    socket.on("disconnect", () => {
      setConnected(false);
    });


    socket.on("message", (message) => {
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

    setMessages((prev) => [...prev, message]);

    socket.emit("message", message);

    setMessage("");
  };


  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>

      <h1>Socket.IO Chat</h1>

      <p>
        Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}
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


      <h3>Messages</h3>


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
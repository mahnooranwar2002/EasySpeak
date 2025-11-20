import React, { useState } from 'react';

const Chatboticon = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessage = { sender: "user", text: input };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true); // Start loading

    try {
      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages([...newMessages, { sender: "bot", text: data.reply }]);
      setIsLoading(false); // Stop loading on success
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { sender: "bot", text: "⚠️ Server error." }]);
      setIsLoading(false); // Stop loading on error
    }
  };

  return (
    <>
      <div className="container chatbox-Section">
        <div className="Chatboticon" onClick={toggleChatbot}>
          <i className="ri-robot-2-fill"></i>
        </div>
      </div>
   
      {isChatbotOpen && (
        <div className="chatbot-container" id='chatbot' >
          <div id="chatbot">
            <div className="chatbot-header">
              <h4>Chatbot</h4>
              <button onClick={toggleChatbot}>&times;</button>
            </div>
            <div className="chatbot-body">
              <div>
                 {messages.length === 0 ? (
                  <div className='msg'>
                  <h4>  Hi! Ask me anything.</h4>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
                      <b>{msg.sender === "user" ? "You" : "Gemini"}:</b> {msg.text}
                    </div>
                  ))
                )}
                
                {/* Conditionally render the loading message */}
                {isLoading && (
                  <div style={{ textAlign: 'left' }}>
                    <b>Gemini:</b> Loading...
                  </div>
                )}
              </div>

             <div className="input-container">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
              />
              
            </div>
            </div>
          </div>
        </div>
      )}
      
    
    </>
  );
};

export default Chatboticon;
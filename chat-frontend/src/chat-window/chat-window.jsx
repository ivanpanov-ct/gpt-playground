import { useState, useEffect } from 'react';
import styles from './chat-window.module.css';

const SERVER_URL = 'http://localhost:8080'

const parseMessageFromAgent = (message) => {
  //TODO put the logic of agent message processing here
  return { from: 'ai', text: message };
};

const ChatWindow = (props) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [agentContext, setAgentContext] = useState({
    history: [],
  });
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const asyncInit = async () => {
      setIsProcessing(true); 
      try {
        const fromAgent = await initializeAgent();
        setMessages([...messages, { from: 'ai', text: fromAgent.message }]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsProcessing(false); 
      }
    };

    asyncInit();
    // You can also load previous messages from local storage, a database, etc.
  }, []); // The empty array means this effect runs once, after initial mount

  async function initializeAgent() {
    try {
      const response = await fetch(`${SERVER_URL}/agent/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.text();
      const fromAgent = JSON.parse(data);
      setAgentContext(fromAgent.agentContext);
      return fromAgent;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function tellAgent(message) {
    try {
      const response = await fetch(`${SERVER_URL}/agent/tell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, agentContext }),
      });

      const data = await response.text();
      const fromAgent = JSON.parse(data);
      setAgentContext(fromAgent.agentContext);

      return fromAgent.message;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false); 
    }
  }

  const handleSend = async () => {
    if (inputValue.trim()) {
      const messageFromUser = { from: 'user', text: inputValue };
      setMessages((prevMessages) => {
        return [...prevMessages, messageFromUser];
      });
      setInputValue('');

      setIsProcessing(true); 

      const responseFromAI = await tellAgent(inputValue, agentContext);
      const parsedMessage = parseMessageFromAgent(responseFromAI);

      setMessages((prevMessages) => {
        return [...prevMessages, parsedMessage];
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const renderFromCommand = (message) => {
    if (message.command.command === 'navigate') {
      return <a href={message.command.page}>here</a>;
    }
  };

  const renderAgentMessage = (message) => {
    if (message.text) {
      return <span><strong>Agent:</strong> {message.text}</span>;
    } else if (message.command) {
      return renderFromCommand(message);
    }
  };

  return (
    <div className={styles['chat-window']}>
      <div className={styles['chat-messages-container']}>
        {messages.map((message, index) => (
          <div
            className={message.from == 'user' ? styles['chat-message-user'] : styles['chat-message-bot']}
            key={index}>{message.from == 'user' ?  <span><strong>User:</strong> {message.text}</span> : renderAgentMessage(message)}
          </div>
        ))}
      </div>
      <div className={styles['chat-bottom-panel']}>
      <input
        className={styles['chat-input']}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ marginRight: '10px' }}
      />

      <button
        className={styles['chat-send-button']}
        disabled={isProcessing}
        onClick={handleSend}>  {isProcessing ? 'Processing...' : 'Send'}</button>
      </div>
      
    </div>
  );
};

export default ChatWindow;

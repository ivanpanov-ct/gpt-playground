import { useState, useEffect } from 'react';
import styles from './chat-window.module.css';

const parseMessageFromAgent = (message) => {
  if (message && message.startsWith('COMMAND:')) {
    try {
      const commandBody = message.replace(/^COMMAND:/, '');
      const command = JSON.parse(commandBody);
      return { from: 'ai', command: command };
    } catch (e) {
      console.err(`could not parse the command received from the agent: ${message}`);
      console.err(e);
      return { from: 'ai', text: message };
    }
  } else {
    return { from: 'ai', text: message };
  }
};

const ChatWindow = (props) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [agentContext, setAgentContext] = useState({
    history: [],
  });

  useEffect(() => {
    const asyncInit = async () => {
      try {
        const fromAgent = await initializeAgent();
        setMessages([...messages, { from: 'ai', text: fromAgent.message }]);
      } catch (error) {
        console.error(error);
      }
    };

    asyncInit();
    // You can also load previous messages from local storage, a database, etc.
  }, []); // The empty array means this effect runs once, after initial mount

  async function initializeAgent() {
    try {
      const response = await fetch('http://localhost:8080/agent/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Initialize' }),
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
      const response = await fetch('http://localhost:8080/agent/tell', {
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
    }
  }

  const handleSend = async () => {
    if (inputValue.trim()) {
      const messageFromUser = { from: 'user', text: inputValue };
      setMessages((prevMessages) => {
        return [...prevMessages, messageFromUser];
      });
      setInputValue('');

      const responseFromAI = await tellAgent(inputValue, agentContext);
      const parsedMessage = parseMessageFromAgent(responseFromAI);

      setMessages((prevMessages) => {
        return [...prevMessages, parsedMessage];
      });
    }
  };

  const handleInit = async () => {
    await initializeAgent();
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
      return message.text;
    } else if (message.command) {
      return renderFromCommand(message);
    }
  };

  return (
    <div className={styles['chat-window']}>
      <div style={{ height: '483px', overflowY: 'scroll', border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
        {messages.map((message, index) => (
          <div
            className={message.from == 'user' ? styles['chat-message-user'] : styles['chat-message-bot']}
            key={index}>{message.from == 'user' ? message.text : renderAgentMessage(message)}
          </div>
        ))}
      </div>
      <input
        className={styles['chat-input']}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ marginRight: '10px' }}
      />

      {/*<button
        className={styles['chat-send-button']}
        onClick={handleInit}>Init</button>*/}
      <button
        className={styles['chat-send-button']}
        onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatWindow;
